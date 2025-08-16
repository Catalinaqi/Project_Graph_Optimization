import { Router } from "express";
import authRouter from "@/router/auth.router";
import userRouter from "@/router/user.router";
import logger from "@/config/logger";

/**
 * 🧭 Router principale API
 *
 * Descrizione:
 * - Inizializza un `Router` di Express che funge da entry point per tutte le rotte REST.
 * - Sottorouter:
 *    🔐 `/auth`  → gestione autenticazione e login/logout
 *    👤 `/users` → gestione utenti (CRUD, ricarica token, ecc.)
 *
 * Flusso con logger:
 * 1. Al momento in cui viene montato un router, viene loggato il path.
 * 2. Quando Express riceve una richiesta su `/api/auth/...` o `/api/users/...`,
 *    la richiesta passa prima da qui e poi viene instradata al relativo sotto-router.
 */

const api = Router();

// 🔐 Rotte di autenticazione
api.use("/auth", (req, _res, next) => {
    logger.info(`➡️ [API Router] Richiesta in ingresso a /auth`, {
        method: req.method,
        url: req.originalUrl,
    });
    next();
}, authRouter);

// 👤 Rotte utente
api.use("/users", (req, _res, next) => {
    logger.info(`➡️ [API Router] Richiesta in ingresso a /users`, {
        method: req.method,
        url: req.originalUrl,
    });
    next();
}, userRouter);

export default api;
