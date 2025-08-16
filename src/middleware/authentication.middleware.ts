// src/common/middleware/authentication.middleware.ts
import { NextFunction, Request, Response } from "express";
import logger from "@/config/logger";
import { getError } from "@/common/util/api.error.util";
import { ErrorEnum } from "@/common/enums";
import { UserPayloadTypeSafe } from "@/common/types";
import { SecurityFactory } from "@/common/security/security.factory"; // ⬅️ integriamo la factory

// Creiamo la strategia JWT una sola volta (tramite factory method)
// ✅ Questo approccio permette di cambiare algoritmo (HS256 ↔ RS256) senza modificare il middleware
const jwt = SecurityFactory.makeJwtStrategy();

/**
 * Middleware di autenticazione con JWT
 *
 * 🎯 Obiettivo:
 *  - Proteggere le rotte che richiedono autenticazione.
 *  - Validare il token JWT presente nell'header `Authorization`.
 *  - Estrarre il payload e memorizzarlo in `req.user` per l'uso nei controller.
 *
 * 🔄 Flusso:
 *  1. Genera o recupera un `request id` (rid) per il tracciamento nei log.
 *  2. Legge l'header `Authorization` dalla richiesta.
 *  3. Valida che l'header sia presente e abbia il formato corretto `Bearer <token>`.
 *  4. Estrae il token.
 *  5. Verifica il token utilizzando la strategia JWT ottenuta dalla factory.
 *  6. Se valido, salva il payload in `req.user` e continua la catena middleware.
 *  7. Se non valido o scaduto, restituisce un errore 401 Unauthorized.
 */
export function authenticationMiddleware(req: Request, res: Response, next: NextFunction): void {
    // STEP 1: Creiamo o recuperiamo un ID di richiesta per tracciamento log
    const rid: string =
        (req.headers["x-request-id"] as string) || Math.random().toString(36).slice(2);

    try {
        logger.debug("[AUTH] [STEP 1] Inizio autenticazione rid=%s", rid);

        // STEP 2: Leggiamo l'header Authorization (supporta case-insensitive e spazi extra)
        const rawHeader = (req.get("authorization") ?? req.headers.authorization ?? "").trim();
        if (!rawHeader) {
            logger.warn("[AUTH] [STEP 2] Header Authorization mancante rid=%s", rid);
            throw getError(ErrorEnum.BAD_REQUEST_ERROR);
        }

        // STEP 3: Validiamo formato Bearer + token (case-insensitive per 'Bearer')
        const [scheme, token] = rawHeader.split(/\s+/);
        if (!/^Bearer$/i.test(scheme) || !token) {
            logger.warn("[AUTH] [STEP 3] Formato Authorization non valido value=%s rid=%s", rawHeader, rid);
            throw getError(ErrorEnum.BAD_REQUEST_ERROR);
        }

        // STEP 4-5: Verifichiamo il token usando la strategia JWT (RS256 di default)
        // La strategia lancia eccezione se token invalido o scaduto
        // const payload = jwt.verify<UserPayloadTypeSafe>(token);
        const payload = jwt.verify(token) as UserPayloadTypeSafe;

        req.user = payload;

        // STEP 6: Autenticazione completata con successo
        logger.info(
            "[AUTH] [STEP 6] Autenticazione OK userId=%s role=%s rid=%s",
            payload.id,
            (payload as any).role,
            rid
        );

        return next(); // Continua con il prossimo middleware o controller
    } catch (err: unknown) {
        // Gestione errori centralizzata
        const message = err instanceof Error ? err.message : String(err);
        logger.error("[AUTH] [FAIL] Errore autenticazione rid=%s err=%s", rid, message, {
            stack: err instanceof Error ? err.stack : undefined,
        });

        // Mappiamo sempre a errore 401 Unauthorized per sicurezza
        const mapped = getError(ErrorEnum.UNAUTHORIZED_ERROR);
        return next(mapped);
    }
}
