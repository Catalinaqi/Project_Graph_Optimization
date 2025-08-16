import { GraphRoleUserEnum } from "@/common/enums";

/**
 * 🧑‍💻 Interfaccia UserPayloadTypeSafe
 *
 * Descrizione:
 * - Definisce la forma del payload contenuto all’interno del token JWT.
 * - Viene usata per tipizzare in modo sicuro `req.user` dopo la verifica del token.
 * - Include campi standard (`iat`, `exp`) e campi custom (id, email, ruolo, token).
 *
 * Campi:
 * - `id`: identificativo univoco dell’utente (stringa UUID o simile).
 * - `email`: email dell’utente autenticato.
 * - `role`: ruolo dell’utente (es. ADMIN, USER) tipizzato tramite `GraphRoleUserEnum`.
 * - `token?`: numero di token residui (opzionale, non sempre presente nel JWT).
 * - `iat?`: “issued at” → timestamp di emissione del token (generato da JWT).
 * - `exp?`: “expiration” → timestamp di scadenza del token (generato da JWT).
 */
interface UserPayloadTypeSafe {
    id: string;
    email: string;
    role: GraphRoleUserEnum;
    token?: number;
    iat?: number;
    exp?: number;
}

/**
 * 🌍 Interfaccia Enviroment
 *
 * Descrizione:
 * - Mappa tutte le variabili di configurazione caricate da `.env`.
 * - Garantisce type-safety nell’oggetto `enviroment` (config centrale del progetto).
 *
 * Campi principali:
 * - `nodeEnv`: ambiente di esecuzione (development, test, production).
 * - `apiPort`: porta su cui gira l’API Express.
 * - `postgres*`: parametri di connessione a PostgreSQL (host, porta, user, db, password).
 * - `jwt*`: configurazione per la gestione dei JWT (chiavi, algoritmo, scadenza).
 * - `saltRounds`: numero di round per l’hash delle password con bcrypt.
 * - `initUserTokens`: numero di token iniziali assegnati a un utente al momento della creazione.
 */
interface Enviroment {
    nodeEnv: string;
    apiPort: number;
    postgresPort: number;
    postgresHost: string;
    postgresUser: string;
    postgresPassword: string;
    postgresDB: string;
    jwtPrivateKeyPath: string;
    jwtPublicKeyPath: string;
    jwtExpiresIn: number;
    jwtAlgorithm: string;
    saltRounds: number;
    initUserTokens: number;

    jwtIssuer?: string; // Issuer del token JWT (opzionale)
    jwtAudience?: string; // Audience del token JWT (opzionale)

}

export { Enviroment, UserPayloadTypeSafe };
