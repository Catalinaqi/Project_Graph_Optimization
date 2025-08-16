// src/middleware/authorization.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { getError } from "@/common/util/api.error.util";
import { ErrorEnum, GraphRoleUserEnum } from "@/common/enums";
import logger from "@/config/logger";


/**
 * # Middleware di Autorizzazione (per Ruoli)
 *
 * ## Obiettivo
 * Garantire che l’utente autenticato possegga **almeno uno** dei ruoli richiesti
 * prima di accedere alla rotta protetta.
 *
 * ## Flusso (STEP)
 * 1) Inizio autorizzazione (log con `rid`)
 * 2) Verifica presenza utente in `req.user` (deve essere già autenticato dal middleware di autenticazione)
 * 3) Estrazione e normalizzazione del ruolo utente (dal JWT/`req.user.role`)
 * 4) Verifica appartenenza del ruolo alla lista di ruoli ammessi
 * 5) Autorizzazione OK → `next()`
 *    In caso contrario → errore centralizzato con `FORBIDDEN_ERROR`
 *
 * ## Esempio d’uso
 * router.post(
 *   "/admin/recharge",
 *   authenticate,
 *   AuthorizationMiddleware.requireRole(GraphRoleUserEnum.ADMIN),
 *   handler
 * );
 */
export class AuthorizationMiddleware {
    static requireRole(...roles: GraphRoleUserEnum[]) {
        return (req: Request, _res: Response, next: NextFunction): void => {
            const rid: string =
                (req.headers["x-request-id"] as string) || Math.random().toString(36).slice(2);

            try {
                logger.debug("[AUTHZ STEP 1] Inizio autorizzazione rid=%s", rid);

                // STEP 2: Utente deve essere già autenticato
                if (!req.user) {
                    logger.warn("[AUTHZ STEP 2] Utente non autenticato rid=%s", rid);
                    return next(getError(ErrorEnum.UNAUTHORIZED_ERROR));
                }

                // STEP 3: Ruolo utente
                const userRole = req.user.role as GraphRoleUserEnum;
                logger.debug("[AUTHZ STEP 3] Ruolo utente=%s rid=%s", userRole, rid);

                // STEP 4: Verifica ruolo
                const allowed = roles.includes(userRole);
                if (!allowed) {
                    logger.warn(
                        "[AUTHZ STEP 4] Accesso negato. richiesti=%s, utente=%s rid=%s",
                        roles.join(", "),
                        userRole,
                        rid
                    );
                    const err = getError(ErrorEnum.FORBIDDEN_ERROR) as Error & { message?: string };
                    err.message = `Requires one of the following roles: ${roles.join(", ")}`;
                    return next(err);
                }

                // STEP 5: OK
                logger.info("[AUTHZ STEP 5] Autorizzazione OK role=%s rid=%s", userRole, rid);
                return next();
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                logger.error("[AUTHZ FAIL] Errore autorizzazione rid=%s err=%s", rid, msg, { err });
                return next(getError(ErrorEnum.FORBIDDEN_ERROR));
            }
        };
    }
}
