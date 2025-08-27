import logger from "@/config/logger";
import environment from "@/config/enviroment";
import Database from "@/database/database";
import { ensureKeysExist } from "@/common/util/generate-keys";
import { initModels } from "@/model"; // models entry point
import listEndpoints from "express-list-endpoints";


/**
 * bootstrap
 *
 * Description:
 * Application entry point that prepares resources and starts the HTTP server.
 *
 * Objective:
 * - Ensure JWT keys exist or generate them.
 * - Acquire the Sequelize singleton instance.
 * - Initialize models and associations.
 * - Verify database connectivity.
 * - Dynamically import the Express application.
 * - Start the server on the configured port.
 *
 * Returns:
 * This function does not return a value. It starts the HTTP server process.
 */
async function bootstrap(): Promise<void> {
    try {
        logger.info("[bootstrap] Starting initialization");

        // Ensure JWT keys are present or generate them if missing
        logger.debug("[bootstrap] Ensuring JWT keys exist using ensureKeysExist()");
        ensureKeysExist();

        // Acquire Sequelize instance
        logger.debug("[bootstrap] Getting Sequelize instance using Database.getInstance()");
        const sequelize = Database.getInstance();

        // Initialize models and associations
        logger.debug("[bootstrap] Initializing models using initModels(sequelize)");
        initModels(sequelize);

        // Test database connection
        logger.debug("[bootstrap] Testing database connection using Database.testConnection()");
        await Database.testConnection();



        // Dynamically import the Express application after models are ready
        logger.debug("[bootstrap] Dynamically importing Express application");
        const { default: app } = await import("@/app");

        console.table(listEndpoints(app));

        // Start HTTP server
        logger.debug("[bootstrap] Starting HTTP server with app.listen()");
        app.listen(environment.apiPort, () => {
            logger.info(`[bootstrap] Server listening at http://localhost:${environment.apiPort}`);
        });
    } catch (err: any) {
        logger.error({
            message: "[bootstrap] Critical error during bootstrap",
            meta: { name: err?.name, message: err?.message, stack: err?.stack }
        });
        process.exit(1);
    }
}

bootstrap();
