import express from "express";
import api from "@/router";
import { errorHandler } from "@/middleware/error.middleware";
import logger from "@/config/logger";

/**
 * Main Express Application
 *
 * Description:
 * Initializes the Express application with core middleware,
 * mounts the API routes, and registers the global error handler.
 */
const app = express();

/**
 * Middleware: JSON Parser
 *
 * Description:
 * Parses incoming requests with JSON payloads.
 */
app.use(express.json());


/**
 * Middleware: Request Logger
 *
 * Description:
 * Logs basic information about each incoming request.
 *
 * Parameters:
 * @param req.method {string} - HTTP method of the request.
 * @param req.originalUrl {string} - Original URL of the request.
 */
app.use((req, _res, next) => {
    logger.info('[App] Incoming request', {
        method: req.method,
        url: req.originalUrl,
    });
    next();
});

/**
 * API Router
 *
 * Description:
 * Mounts all API endpoints under the /api prefix.
 */
app.use("/api", api);

/**
 * Middleware: Global Error Handler
 *
 * Description:
 * Handles all errors thrown in the application,
 * logs them, and returns a standardized JSON response.
 */
app.use(errorHandler);

/**
 * Application Initialization Log
 *
 * Description:
 * Logs when the Express application is fully initialized and ready.
 */
logger.info("[App] Express application initialized and ready to receive requests.");

export default app;
