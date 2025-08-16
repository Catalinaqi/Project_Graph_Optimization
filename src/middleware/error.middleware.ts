import type { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

/**
 * 🧯 Middleware globale di gestione errori
 *
 * Descrizione generale:
 * - Cattura tutte le eccezioni lanciate nei controller o nei service
 *   e non già gestite da altri middleware.
 * - Converte l’errore in una risposta HTTP standardizzata.
 *
 * Flusso:
 * 1. Riceve un oggetto `err` (può essere un `Error` o un oggetto custom con `status`, `code`, `message`).
 * 2. Determina:
 *    - `status`: codice HTTP (default 500 Internal Server Error).
 *    - `code`: codice di errore interno o stringa generica (default "ServerError").
 *    - `msg`: messaggio da restituire al client (default "Internal Server Error").
 * 3. Restituisce una risposta JSON con `{ error, message }`.
 *
 * Vantaggi:
 * - Centralizza la gestione degli errori.
 * - Evita duplicazioni nei singoli controller.
 * - Permette di restituire messaggi coerenti e uniformi ai client.
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
    const name = err?.constructor?.name ?? "ServerError";
    const status = Number(err?.status) || 500;
    const message = err?.message || "Unexpected error";

    logger.error({
        message: `[Error] ${name}`,
        meta: {
            status,
            message,
            // importante para depurar
            stack: err?.stack,
            err, // para ver si nos pasan un objeto plano
        },
    });

    res.status(status).json({ error: name, message });
}
