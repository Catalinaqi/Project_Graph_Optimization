import type { Request, Response, NextFunction } from 'express';
import UserService from '@/service/UserService';
import logger from '@/config/logger';

/**
 * 👤 UserController
 *
 * Descrizione generale:
 * - Gestisce le richieste HTTP relative agli utenti.
 * - Richiede che l’utente sia già autenticato (tramite middleware JWT).
 * - Espone metodi per:
 *   🔹 recuperare il profilo dell’utente autenticato
 *   🔹 ricaricare i token (operazione riservata ad admin)
 */
export const UserController = {
    /**
     * GET /users/me
     * - Restituisce il profilo dell’utente autenticato.
     *
     * Flusso:
     * 1. Logga l’ingresso della richiesta.
     * 2. Usa `req.user!.id` (inserito dal middleware JWT).
     * 3. Chiama `UserService.me` per recuperare i dati dal DB.
     * 4. Restituisce `200 OK` con i dati del profilo.
     * 5. In caso di errore, passa l’eccezione a `next(err)`.
     */
    async me(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug('[UserController] /me chiamato');
            const out = await UserService.me(req.user!.id);
            res.status(200).json(out);
        } catch (err) { next(err); }
    },

    /**
     * POST /users/recharge
     * - Ricarica il saldo token di un utente (azione consentita solo ad admin).
     * - Registra anche un audit dell’operazione.
     *
     * Flusso:
     * 1. Logga l’ingresso della richiesta.
     * 2. Estrae `email`, `newBalance` e `reason` dal body.
     * 3. Usa `req.user!.id` come id dell’admin che effettua la ricarica.
     * 4. Chiama `UserService.adminRecharge` per aggiornare il saldo.
     * 5. Restituisce `200 OK` con messaggio di conferma e nuovo saldo.
     * 6. In caso di errore, passa l’eccezione a `next(err)`.
     */
    async recharge(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug('[UserController] /recharge chiamato');
            const { email, newBalance, reason } = req.body;
            const out = await UserService.adminRecharge(
                email,
                Number(newBalance),
                req.user!.id,
                reason
            );
            res.status(200).json({ message: 'Tokens actualizados', ...out });
        } catch (err) { next(err); }
    },
};
