import type { UserPayloadTypeSafe } from "@/common/types";
import JwtUtils from "@/common/util/jwt.util";
import {loggers} from 'winston';

/**
 * 🧩 Interfaccia JwtStrategy
 *
 * Descrizione:
 * - Definisce il "contratto" per tutte le strategie JWT.
 * - Permette di avere più implementazioni (es. HS256, RS256, mock per i test)
 *   senza cambiare il resto del codice.
 *
 * Metodi:
 * - `sign(payload)`: genera un token JWT a partire da un payload utente.
 * - `verify(token)`: valida un token JWT e restituisce il payload decodificato.
 */
export interface JwtStrategy {
    sign(payload: Omit<UserPayloadTypeSafe, "iat" | "exp">): string;
    verify(token: string): UserPayloadTypeSafe;
}

/**
 * 🔐 Implementazione concreta di JwtStrategy con algoritmo RS256
 *
 * Descrizione:
 * - Usa la classe `JwtUtils` (già implementata nel progetto) per generare
 *   e verificare token firmati con chiavi asimmetriche (RS256).
 * - Incapsula la logica in modo che, se un domani si volesse cambiare algoritmo
 *   (es. HS256 o altro), basta creare una nuova classe che implementa `JwtStrategy`.
 *
 * Flusso:
 * 1. `sign(payload)` → richiama `JwtUtils.generateToken` per firmare il payload.
 * 2. `verify(token)` → richiama `JwtUtils.verifyToken` per validare il token e
 *    restituire un `UserPayloadTypeSafe`.
 */
export class RS256JwtStrategy implements JwtStrategy {
    sign(payload: Omit<UserPayloadTypeSafe, "iat" | "exp">): string {
        return JwtUtils.generateToken(payload as any);
    }

    verify(token: string): UserPayloadTypeSafe {
        return JwtUtils.verifyToken(token) as UserPayloadTypeSafe;
    }
}
