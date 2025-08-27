import { type Options, Sequelize } from "sequelize";
import environment from "@/config/enviroment";
import logger from "@/config/logger";

/**
 * Database Class (Singleton)
 *
 * Description:
 * Implements the Singleton Design Pattern to ensure that only one instance
 * of Sequelize is created and reused throughout the application.
 *
 * Objective:
 * - Configure the PostgreSQL connection using environment variables.
 * - Provide static methods to:
 *   - getInstance: return the shared Sequelize instance.
 *   - testConnection: check if the database is reachable.
 *   - sync: synchronize Sequelize models with the database schema (useful in development).
 */
export default class Database {
  /**
   * Singleton instance of Sequelize.
   */
  private static instance: Sequelize | null = null;

  /**
   * Private constructor to prevent instantiation with `new Database()`.
   */
  private constructor() {}

  /**
   * getInstance
   *
   * Description:
   * Returns the single Sequelize instance. If it does not exist yet,
   * creates and configures a new one.
   *
   * Returns:
   * @returns {Sequelize} - The Sequelize instance.
   */
  public static getInstance(): Sequelize {
    if (!Database.instance) {
      const {
        postgresUser,
        postgresPassword,
        postgresDB,
        postgresHost,
        postgresPort,
        nodeEnv,
      } = environment;

      logger.info("[Database] Creating new Sequelize instance", {
        host: postgresHost,
        port: postgresPort,
        db: postgresDB,
        user: postgresUser,
        env: nodeEnv,
      });

      const options: Options = {
        host: postgresHost,
        port: postgresPort,
        dialect: "postgres",
        logging: (msg) => logger.debug(`[Sequelize] ${msg}`),
        dialectOptions:
          nodeEnv === "production" && process.env.PGSSL === "true"
            ? {
                ssl: {
                  require: true,
                  rejectUnauthorized: false,
                },
              }
            : undefined,
      };

      Database.instance = new Sequelize(
        postgresDB,
        postgresUser,
        postgresPassword,
        options,
      );

      logger.info("[Database] Sequelize instance created successfully");
    }
    return Database.instance;
  }

  /**
   * testConnection
   *
   * Description:
   * Tests the connection to the PostgreSQL database.
   *
   * Objective:
   * Calls `sequelize.authenticate()` to verify the database is reachable.
   *
   * Returns:
   * @returns {Promise<void>} - Resolves if the connection is successful, rejects otherwise.
   */
  public static async testConnection(): Promise<void> {
    const sequelize = this.getInstance();
    try {
      await sequelize.authenticate();
      logger.info("[Database] Database connection successful");
    } catch (error: any) {
      logger.error("[Database] Database connection failed", {
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * sync
   *
   * Description:
   * Synchronizes the Sequelize models with the PostgreSQL database.
   *
   * Objective:
   * Useful in development to create or update tables automatically.
   * Use caution with `force: true` as it drops existing tables.
   *
   * Parameters:
   * @param options.force {boolean} - If true, drops and recreates tables.
   * @param options.alter {boolean} - If true, updates existing tables to match models.
   *
   * Returns:
   * @returns {Promise<void>} - Resolves when synchronization is complete.
   */
  public static async sync(options?: { force?: boolean; alter?: boolean }) {
    const sequelize = this.getInstance();
    try {
      logger.info("[Database] Starting model synchronization", options);
      await sequelize.sync({
        ...options,
      });
      logger.info("[Database] Model synchronization completed successfully");
    } catch (error: any) {
      logger.error("[Database] Error during model synchronization", {
        message: error.message,
      });
      throw error;
    }
  }
}
