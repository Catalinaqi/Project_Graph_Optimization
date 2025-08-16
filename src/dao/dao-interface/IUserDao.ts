import type { GraphUser } from '@/model/GraphUser';

/**
 * 🗂️ Interfaccia IUserDao
 *
 * Descrizione generale:
 * - Definisce il contratto per l’accesso diretto ai dati degli utenti nel database.
 * - È il livello più vicino al DB: ogni metodo corrisponde a un’operazione CRUD o simile.
 * - Viene implementata da `UserDao`, che usa i modelli Sequelize.
 *
 * Metodi principali:
 *  - `findByEmail` → cerca un utente a partire dall’email
 *  - `findById` → cerca un utente tramite id (chiave primaria)
 *  - `createUser` → crea un nuovo utente con i campi base
 *  - `setNewBalance` → aggiorna il saldo dei token e restituisce dettagli della modifica
 */
export interface IUserDao {
    /**
     * 🔎 Recupera un utente a partire dall’email.
     * @param email - indirizzo email dell’utente
     * @returns `GraphUser` se trovato, `null` altrimenti
     */
    findByEmail(email: string): Promise<GraphUser | null>;

    /**
     * 🔎 Recupera un utente a partire dall’id (chiave primaria).
     * @param id - identificativo univoco dell’utente
     * @returns `GraphUser` se trovato, `null` altrimenti
     */
    findById(id: string): Promise<GraphUser | null>;

    /**
     * ➕ Crea un nuovo utente nel database.
     * @param data - oggetto con email, password hashata, ruolo (user/admin) e token iniziali
     * @returns `GraphUser` creato
     */
    createUser(data: {
        email_user: string;
        password_user: string;
        role_user?: 'user' | 'admin';
        tokens_user?: string;
    }): Promise<GraphUser>;

    /**
     * 💰 Aggiorna il saldo token di un utente.
     * @param userId - id dell’utente target
     * @param newBalance - nuovo saldo token
     * @param performerId - id dell’admin/utente che effettua l’operazione (può essere null)
     * @param reason - motivazione dell’operazione (es. "admin recharge")
     * @returns Oggetto con token precedenti, nuovi token e differenza
     */
    setNewBalance(
        userId: string,
        newBalance: number,
        performerId: string | null,
        reason: string
    ): Promise<{ previousTokens: number; newTokens: number; diff: number }>;
}
