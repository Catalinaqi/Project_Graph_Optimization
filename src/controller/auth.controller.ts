import type { Request, Response, NextFunction } from 'express';
import AuthService from '@/service/AuthService';
import logger from '@/config/logger';

/**
 * 🔐 AuthController
 *
 * Descrizione generale:
 * - Gestisce le richieste HTTP relative all’autenticazione degli utenti.
 * - Espone i metodi per la registrazione e il login.
 * - Ogni metodo coordina la chiamata al rispettivo service (`AuthService`),
 *   gestisce la risposta HTTP e cattura eventuali errori.
 */
export const AuthController = {
    /**
     * POST /auth/register
     * - Registra un nuovo utente standard (ruolo = user).
     *
     * Flusso:
     * 1. Logga l’ingresso della richiesta.
     * 2. Estrae `email` e `password` dal body.
     * 3. Chiama `AuthService.register` per creare l’utente.
     * 4. Restituisce `201 Created` con un messaggio e i dati di registrazione.
     * 5. In caso di errore, delega a `next(err)` → gestito dal middleware errori.
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug('[AuthController] /register chiamato');
            const { email, password } = req.body;
            const result = await AuthService.register(email, password);
            res.status(201).json({ message: 'Usuario registrado', ...result });
        } catch (err) { next(err); }
    },

    /**
     * POST /auth/login
     * - Autentica un utente e restituisce un JWT (algoritmo RS256).
     *
     * Flusso:
     * 1. Logga l’ingresso della richiesta.
     * 2. Estrae `email` e `password` dal body.
     * 3. Chiama `AuthService.login` per verificare credenziali e generare JWT.
     * 4. Restituisce `200 OK` con il token e i dati associati all’utente.
     * 5. In caso di errore, delega a `next(err)` → gestito dal middleware errori.
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            logger.debug('[AuthController] /login chiamato');
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            res.status(200).json(result);
        } catch (err) { next(err); }
    },
};
