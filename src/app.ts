import express from "express";
import api from "@/router";
import { errorHandler } from "@/middleware/error.middleware";
import logger from "@/config/logger";
import {requestId} from '@/middleware/requestId';

/**
 * 🚀 Applicazione principale Express
 *
 * Descrizione:
 * - Inizializza l'app Express con i middleware fondamentali.
 * - Registra i router dell'API (`/api`).
 * - Registra l'error handler globale.
 *
 * Flusso con logger:
 * 1. Avvio dell'applicazione: log informativo al bootstrap.
 * 2. Ogni richiesta in ingresso viene intercettata e loggata (metodo + url).
 * 3. Se avviene un errore, passa ad `errorHandler`, che logga e restituisce risposta JSON.
 */

const app = express();

// 🧩 Middleware built-in: parsing JSON
app.use(express.json());

app.use(requestId)

// 🔎 Log di ogni richiesta in ingresso (prima di passare ai router)
app.use((req, _res, next) => {
    logger.info(`➡️ [App] Richiesta ricevuta`, {
        method: req.method,
        url: req.originalUrl,
    });
    next();
});

// 📌 Monta le rotte API sotto il prefisso /api
app.use("/api", api);

// 🧯 Gestione errori globale
app.use(errorHandler);

// ✅ Log quando l'app è pronta
logger.info("✅ Applicazione Express inizializzata e pronta a ricevere richieste.");

export default app;
