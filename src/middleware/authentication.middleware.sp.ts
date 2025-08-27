import {NextFunction, Request, Response} from "express";
import JwtUtils from "@/common/util/jwt.util";
import {getError} from "@/common/util/api-error";
import {UserPayloadTypeSafe} from "@/common/types";
import {ErrorEnum} from "@/common/enums";
import logger from "@/config/logger";



/**
 * Middleware di autenticazione con JWT
 *
 * 🎯 Obiettivo:
 *   - Proteggere le rotte che richiedono un utente autenticato.
 *   - Verificare il token JWT presente nell'header Authorization.
 *   - Estrarre il payload e salvarlo in `req.user` per l'uso nei controller successivi.
 *
 * 🔄 Flusso generale:
 *   1. Genera o recupera un `request id` per tracciare la richiesta nei log.
 *   2. Legge l'header `Authorization` dalla richiesta.
 *   3. Controlla che sia presente e nel formato corretto `Bearer <token>`.
 *   4. Estrae il token dalla stringa.
 *   5. Verifica la validità del token con `JwtUtils.verifyToken`.
 *   6. Se valido, assegna il payload decodificato a `req.user`.
 *   7. Logga l'esito dell'operazione (successo o errore).
 *   8. Passa il controllo al middleware o controller successivo con `next()`.
 *
 * ➡️ Step successivo:
 *   - Questo middleware deve essere collegato alle rotte protette
 *     (es. `router.get("/models", authenticate, handler)`).
 *   - Dopo l'autenticazione, eventuali middleware di autorizzazione
 *     (es. `requireAdmin`, `requireModelOwner`) possono controllare i permessi.
 */


export function authenticationMiddlewareSp(req: Request, res: Response, next: NextFunction): void {
    const rid: string =
        (req.headers["x-request-id"] as string) || Math.random().toString(36).slice(2);

    try {
        logger.debug("[STEP 1] Inizio autenticazione rid=%s", rid);

        // STEP 2: Leggo header Authorization
        const authHeader: string | undefined = req.headers.authorization;
        if (!authHeader) {
            logger.warn("[STEP 2] Header Authorization mancante rid=%s", rid);
            throw getError(ErrorEnum.BAD_REQUEST_ERROR);
        }

        // STEP 3: Controllo formato Bearer <token>
        const tokenParts: string[] = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            logger.warn("[STEP 3] Formato Authorization non valido value=%s rid=%s", authHeader, rid);
            throw getError(ErrorEnum.BAD_REQUEST_ERROR);
        }

        // STEP 4: Estraggo token
        const token: string = tokenParts[1];
        if (!token) {
            logger.warn("[STEP 4] Token vuoto rid=%s", rid);
            throw getError(ErrorEnum.UNAUTHORIZED_ERROR);
        }

        // STEP 5: Verifico token
        const payload = JwtUtils.verifyToken(token);
        req.user = <UserPayloadTypeSafe>payload;

        // STEP 6: Autenticazione completata
        logger.info("[STEP 6] Autenticazione OK userId=%s role=%s rid=%s",
            payload.id,
            (payload as any).role,
            rid
        );

        next();
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error("[FAIL] Errore autenticazione rid=%s err=%s", rid, err.message, {stack: err.stack});
        } else {
            logger.error("[FAIL] Errore non previsto rid=%s", rid, {value: err});
        }
        next(err as any);
    }
}
