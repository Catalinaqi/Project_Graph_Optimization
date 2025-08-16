import { type Options, Sequelize } from "sequelize";
import environment from "@/config/enviroment";
import logger from "@/config/logger";

/**
 * 🗄️ Classe Database (Singleton)
 *
 * Descrizione:
 * - Implementa il **Design Pattern Singleton**: una sola istanza di `Sequelize` viene creata e riutilizzata.
 * - Configura la connessione a PostgreSQL leggendo le variabili da `environment`.
 * - Espone metodi statici per:
 *   🔹 `getInstance` → ottenere l'istanza condivisa di Sequelize
 *   🔹 `testConnection` → verificare che il DB risponda (health check)
 *   🔹 `sync` → sincronizzare i modelli con lo schema (solo in sviluppo!)
 *
 * Flusso con logger:
 * 1. Se non esiste un'istanza, viene creata (connessione a PostgreSQL).
 * 2. Ogni query SQL viene loggata in `debug` tramite Winston.
 * 3. Connessione testata con log di successo o di errore.
 */

export default class Database {
  // 🔒 Istanza Singleton di Sequelize
  private static instance: Sequelize | null = null;


  // 🚫 Costruttore privato → impedisce l'uso di `new Database()`
  private constructor() {}

  /**
   * 📌 Restituisce l'istanza unica di Sequelize
   * - Se non esiste, la crea con le opzioni di configurazione.
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

      logger.info("➡️ [Database] Creazione nuova istanza Sequelize", {
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

      logger.info("✅ [Database] Istanza Sequelize creata con successo");
    }
    return Database.instance;
  }

  /**
   * 🩺 Verifica la connessione al database.
   * - Chiama `sequelize.authenticate()`
   * - Logga successo o fallimento.
   */
  public static async testConnection(): Promise<void> {
    const sequelize = this.getInstance();
    try {
      await sequelize.authenticate();
      logger.info("✅ [Database] Connessione al DB riuscita");
    } catch (error: any) {
      logger.error("❌ [Database] Errore di connessione al DB", {
        message: error.message,
      });
      throw error;
    }
  }

  /**
   * 🔄 Sincronizza i modelli con il database
   * - Utile solo in sviluppo (attenzione con `force: true` perché droppa le tabelle!)
   */
  public static async sync(options?: { force?: boolean; alter?: boolean }) {
    const sequelize = this.getInstance();
    try {
      logger.info("➡️ [Database] Avvio sync dei modelli", options);
      await sequelize.sync({
        ...options,
      });
      logger.info("✅ [Database] Sync completato con successo");
    } catch (error: any) {
      logger.error("❌ [Database] Errore durante il sync dei modelli", {
        message: error.message,
      });
      throw error;
    }
  }
}
