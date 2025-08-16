import logger from "@/config/logger";
import environment from "@/config/enviroment";
import Database from "@/database/database";
import { ensureKeysExist } from "@/common/util/generateKeys";

// ⬅️ Importa la funzione che inizializza i modelli Sequelize
//import { initModels } from "@/dao/index"; // alternativa
import { initModels } from "@/model"; // punto di ingresso dei tuoi modelli

/**
 * 🚀 bootstrap
 *
 * Funzione di avvio dell’applicazione.
 *
 * 🔄 Flusso operativo:
 * 1. Verifica la presenza delle chiavi JWT (se non esistono, le genera).
 * 2. Recupera un’istanza singleton di Sequelize (`Database.getInstance`).
 * 3. Inizializza i modelli e le loro associazioni (`initModels`).
 * 4. Testa la connessione al database (`Database.testConnection`).
 * 5. Importa dinamicamente l’app Express solo dopo che i modelli sono pronti.
 * 6. Avvia il server HTTP e lo mette in ascolto sulla porta definita in `environment.apiPort`.
 *
 * ❌ Gestione errori:
 * - Se qualcosa fallisce, logga i dettagli (nome, messaggio, stack).
 * - Termina il processo con `process.exit(1)` per evitare stato incoerente.
 */
async function bootstrap() {
    try {
        ensureKeysExist();                       // 1) chiavi JWT pronte

        const sequelize = Database.getInstance();// 2) istanza Sequelize

        initModels(sequelize);                   // 3) inizializza modelli + associazioni

        await Database.testConnection();         // 4) test connessione DB

        const { default: app } = await import("@/app"); // 5) importa Express app
        app.listen(environment.apiPort, () => {
            logger.info(`🚀 Server en http://localhost:${environment.apiPort}`);
        });
    } catch (err: any) {
        logger.error({
            message: "❌ Error en bootstrap",
            meta: { name: err?.name, message: err?.message, stack: err?.stack }
        });
        process.exit(1); // 6) uscita forzata in caso di errore
    }
}

bootstrap();
