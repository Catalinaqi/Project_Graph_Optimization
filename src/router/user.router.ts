import { Router } from 'express';
import { UserController } from '@/controller/user.controller';
import { authenticationMiddlewareSp } from '@/middleware/authentication.middleware.sp';
import {AuthorizationMiddleware} from '@/middleware/authorization.middleware';

/**
 * 👤 Router: rotte dedicate agli utenti
 *
 * Descrizione generale:
 * - Gestisce le chiamate HTTP relative agli utenti (profilo, ricarica token, ecc.).
 * - Tutte le rotte sono protette da autenticazione JWT.
 * - Per operazioni sensibili (es. ricarica token) è previsto anche un controllo
 *   di autorizzazione tramite ruoli.
 */

const router = Router();

/**
 * GET /users/me
 * - Restituisce le informazioni dell’utente autenticato.
 * - Flusso:
 *   1. Passa dal middleware `authenticationMiddlewareSp` → valida JWT e popola `req.user`.
 *   2. Viene invocato `UserController.me` che recupera e ritorna i dati dell’utente.
 */
router.get('/me', authenticationMiddlewareSp, UserController.me);

/**
 * POST /users/recharge
 * - Permette la ricarica dei token di un utente.
 * - Flusso:
 *   1. `authenticationMiddlewareSp` → verifica che l’utente sia autenticato.
 *   2. `AuthorizationMiddleware.requireRole()` → controlla che l’utente abbia
 *      i permessi necessari (es. ADMIN).
 *   3. `UserController.recharge` → esegue la logica di ricarica dei token e restituisce il risultato.
 */
router.post('/recharge', authenticationMiddlewareSp, AuthorizationMiddleware.requireRole(), UserController.recharge);

export default router;
