// src/common/util/jwt.util.ts
import fs from "fs";
import path from "path";
import jwt, { Algorithm, JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";

import environment from "@/config/enviroment";
import logger from "@/config/logger";

import { ErrorEnum } from "@/common/enums";
import { getError } from "@/common/util/api.error.util";
import type { UserPayloadTypeSafe } from "@/common/types";

/**
 * 🔐 JwtUtils
 *
 * Classe di utilità che gestisce la creazione e verifica dei token JWT
 * utilizzando l’algoritmo **RS256**.
 *
 * 📌 Funzionalità principali:
 * 1. Carica chiavi privata/pubblica da file o ENV (PEM inline).
 * 2. Genera token firmati con la chiave privata (`generateToken`).
 * 3. Verifica e decodifica token con la chiave pubblica (`verifyToken`).
 * 4. Traduce errori della libreria `jsonwebtoken` in errori applicativi
 *    coerenti con il dominio (`ErrorEnum`).
 */
export default class JwtUtils {
    /**
     * 📥 Carica una chiave (privata/pubblica) da:
     * - Variabile ENV (inline PEM con `\n`).
     * - Percorso assoluto/relativo a file `.pem`.
     *
     * 🔄 Flusso:
     * - Se la stringa contiene `BEGIN` → interpreta come chiave inline.
     * - Altrimenti assume sia un path a file e tenta la lettura.
     * - Effettua validazioni di sicurezza (non vuota, contiene blocco PEM).
     *
     * @param source stringa (chiave inline o path)
     * @param label tipo di chiave ("private" | "public")
     * @returns stringa PEM valida
     */
    private static readKey(source: string | undefined, label: "private" | "public"): string {
        if (!source || !source.trim()) {
            throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key path/content not provided`);
        }
        // Caso chiave PEM inline
        if (source.includes("BEGIN")) {
            const pem = source.replace(/\\n/g, "\n").trim();
            if (!pem) throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key (inline) is empty`);
            logger.debug({ message: `[JwtUtils] ${label} key loaded from ENV (inline)`, meta: { bytes: pem.length } });
            return pem;
        }
        // Caso path a file
        const abs = path.isAbsolute(source) ? source : path.resolve(process.cwd(), source);
        if (!fs.existsSync(abs)) {
            throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key file not found at: ${abs}`);
        }
        const pem = fs.readFileSync(abs, "utf8").trim();
        if (!pem) throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key file is empty at: ${abs}`);
        if (!pem.includes("BEGIN")) {
            throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key at ${abs} is not a valid PEM`);
        }
        logger.debug({ message: `[JwtUtils] ${label} key loaded from file`, meta: { path: abs, bytes: pem.length } });
        return pem;
    }

    // ⚙️ Configurazioni globali caricate da ENV
    private static readonly algorithm: Algorithm = (environment.jwtAlgorithm as Algorithm) || "RS256";
    private static readonly privateKey: string = JwtUtils.readKey(environment.jwtPrivateKeyPath, "private");
    private static readonly publicKey: string  = JwtUtils.readKey(environment.jwtPublicKeyPath, "public");
    private static readonly expiresIn: number  = Number(environment.jwtExpiresIn || 3600);

    /**
     * ✍️ Genera un token JWT per l’utente
     *
     * Flusso:
     * 1. Logga il payload (senza `iat/exp`).
     * 2. Firma con la chiave privata.
     * 3. Imposta opzioni standard (algoritmo, scadenza, issuer, audience).
     *
     * In caso di errore, converte l’eccezione in `ErrorEnum.SERVER_ERROR`.
     *
     * @param payload dati dell’utente (id, email, ruolo, ecc.)
     * @returns token JWT firmato
     */
    static generateToken(payload: UserPayloadTypeSafe): string {
        try {
            logger.debug({ message: "[JwtUtils] Generazione token JWT", meta: { payload: { ...payload, iat: undefined, exp: undefined } } });
            const opts: SignOptions = {
                algorithm: this.algorithm,
                expiresIn: this.expiresIn,
                issuer: environment.jwtIssuer || undefined,
                audience: environment.jwtAudience || undefined,
            };
            return jwt.sign(payload as any, this.privateKey, opts);
        } catch (err: any) {
            logger.error({ message: "[JwtUtils] Errore nella generazione del token", meta: { err: err?.message } });
            throw getError(ErrorEnum.SERVER_ERROR, err?.message || "JWT sign failed");
        }
    }

    /**
     * 🔎 Verifica un token JWT e restituisce il payload decodificato
     *
     * Flusso:
     * 1. Applica opzioni di verifica (algoritmo, issuer, audience).
     * 2. Usa la chiave pubblica per validare la firma.
     * 3. Controlla che il risultato sia un oggetto (`JwtPayload`) e non una stringa.
     * 4. Logga informazioni principali (`sub`, `exp`).
     * 5. In caso di errore:
     *    - `TokenExpiredError` → `ErrorEnum.JWT_EXPIRED`
     *    - `JsonWebTokenError` → `ErrorEnum.INVALID_JWT_SIGNATURE`
     *    - `NotBeforeError`    → `ErrorEnum.JWT_NOT_ACTIVE`
     *    - altri → `ErrorEnum.SERVER_ERROR`
     *
     * @param token stringa JWT
     * @returns payload tipizzato (`UserPayloadTypeSafe & JwtPayload`)
     */
    static verifyToken(token: string): UserPayloadTypeSafe & JwtPayload {
        try {
            const opts: VerifyOptions = {
                algorithms: [this.algorithm],
                issuer: environment.jwtIssuer || undefined,
                audience: environment.jwtAudience || undefined,
            };
            const decoded = jwt.verify(token, this.publicKey, opts) as JwtPayload;

            if (typeof decoded === "string") {
                throw getError(ErrorEnum.INVALID_JWT_FORMAT, "JWT payload is a string, expected object");
            }

            logger.debug({ message: "[JwtUtils] Token valido", meta: { sub: decoded.sub, exp: decoded.exp } });
            return decoded as UserPayloadTypeSafe & JwtPayload;
        } catch (err: any) {
            const name = err?.name;
            const msg  = err?.message || "JWT verify failed";

            if (name === "TokenExpiredError") {
                throw getError(ErrorEnum.JWT_EXPIRED, msg);
            }
            if (name === "JsonWebTokenError") {
                throw getError(ErrorEnum.INVALID_JWT_SIGNATURE, msg);
            }
            if (name === "NotBeforeError") {
                throw getError(ErrorEnum.JWT_NOT_ACTIVE, msg);
            }

            logger.error({ message: "[JwtUtils] Errore verifica token", meta: { name, msg } });
            throw getError(ErrorEnum.SERVER_ERROR, msg);
        }
    }
}
