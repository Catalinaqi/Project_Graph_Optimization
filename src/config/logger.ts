import { createLogger, format, transports } from "winston";

/**
 * 📝 Logger applicativo (Winston)
 *
 * Descrizione:
 * - Crea un logger centralizzato per tutta l’applicazione.
 * - Livello di log configurabile tramite variabile d’ambiente `LOG_LEVEL` (default: debug).
 * - Output in console con timestamp, livello, messaggio e metadati opzionali.
 * - In caso di errori, mostra anche lo stack trace.
 *
 * Flusso:
 * 1. Ogni log riceve un `timestamp`.
 * 2. Se l’oggetto passato contiene `Error`, viene incluso lo `stack`.
 * 3. I parametri extra (`meta`) vengono serializzati in JSON.
 * 4. L’output viene stampato su `Console` (ma può essere esteso a file, DB, ecc.).
 */

const logger = createLogger({
    // 📌 livello minimo di log: può essere "error", "warn", "info", "debug"...
    level: process.env.LOG_LEVEL || "debug",

    // 🎨 formattazione dei log
    format: format.combine(
        format.timestamp(),                  // aggiunge timestamp ISO
        format.errors({ stack: true }),      // include stack trace per gli errori
        format.splat(),                      // permette stringhe tipo "valore: %s"
        format.printf(({ level, message, timestamp, stack, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
            return `${timestamp} ${level}: ${stack ?? message}${metaStr}`;
        })
    ),

    // 📤 trasporto: stampa i log in console
    transports: [new transports.Console()],
});

export default logger;
