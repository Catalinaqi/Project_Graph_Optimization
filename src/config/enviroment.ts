import { Enviroment } from "@/common/types";
import dotenv from "dotenv";

// 🌱 Carica le variabili da file .env in process.env
dotenv.config();

/**
 * 🌍 Configurazione dell'ambiente applicativo
 *
 * Descrizione:
 * - Centralizza tutte le variabili di configurazione lette da `.env`.
 * - Espone un oggetto tipizzato `Enviroment` per garantire sicurezza a compile-time.
 * - Fornisce valori di default nel caso in cui manchino variabili in `.env`.
 *
 * Flusso:
 * 1. `dotenv.config()` legge il file `.env` e popola `process.env`.
 * 2. Ogni proprietà viene mappata su un campo del tipo `Enviroment`.
 * 3. Se una variabile non è definita, viene usato un valore di fallback sicuro.
 */
const enviroment: Enviroment = {
    // 🌐 Ambiente di esecuzione (development, test, production)
    nodeEnv: process.env.NODE_ENV || "development",

    // 🚪 Porta su cui l'applicazione Express ascolta
    apiPort: Number(process.env.API_PORT) || 3000,

    // 🗄️ Configurazione database PostgreSQL
    postgresUser: process.env.POSTGRES_USER || "postgres",
    postgresPassword: process.env.POSTGRES_PASSWORD || "postgres",
    postgresDB: process.env.POSTGRES_DB || "graphdb",
    postgresHost: process.env.POSTGRES_HOST || "postgres", // se usi Docker, il service name
    postgresPort: Number(process.env.POSTGRES_PORT) || 5432,

    // 🔐 JWT: chiavi, algoritmo e scadenza
    jwtPrivateKeyPath:
        (process.env.JWT_PRIVATE_KEY_PATH ?? "").trim() || "../../keys/private.key", // path della chiave privata
    jwtPublicKeyPath:
        (process.env.JWT_PUBLIC_KEY_PATH  ?? "").trim() || "../../keys/public.key",   // path della chiave pubblica
    jwtExpiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600,       // default: 1h (in secondi)
    jwtAlgorithm: process.env.JWT_ALGORITHM || "RS256",             // default: RS256

    // 🔑 Sicurezza password
    saltRounds: Number(process.env.JWT_SALT_ROUNDS) || 12, // default: 12 round bcrypt

    // 🎟️ Token iniziali assegnati a un nuovo utente
    initUserTokens: Number(process.env.INIT_USER_TOKENS) || 0,

    jwtIssuer: (process.env.JWT_ISSUER ?? "").trim() || "myapp",
    jwtAudience: (process.env.JWT_AUDIENCE ?? "").trim() || "myapp-users",


};

export default enviroment;
