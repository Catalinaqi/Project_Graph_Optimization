import type { GraphUser } from '@/model/GraphUser';

/**
 * 🗂️ Interfaccia IUserRepository
 *
 * Descrizione generale:
 * - Definisce il contratto per un repository utenti.
 * - Stabilisce i metodi che qualsiasi implementazione (es. `UserRepository`) deve offrire.
 * - Garantisce type-safety e separazione tra livello astratto (interfaccia) e implementazione concreta.
 *
 * Metodi principali:
 *  - `getByEmail` → cerca un utente per email
 *  - `getById` → cerca un utente per id
 *  - `create` → crea un nuovo utente con password hashata e saldo iniziale
 *  - `updateBalanceByEmail` → aggiorna il saldo token di un utente e ritorna i dettagli della modifica
 */
export interface IUserRepository {
    /**
     * 🔎 Recupera un utente dal database a partire dall’email.
     * @param email - indirizzo email dell’utente
     * @returns `GraphUser` o `null` se non trovato
     */
    getByEmail(email: string): Promise<GraphUser | null>;

    /**
     * 🔎 Recupera un utente dal database a partire dall’id.
     * @param id - identificativo univoco dell’utente
     * @returns `GraphUser` o `null` se non trovato
     */
    getById(id: string): Promise<GraphUser | null>;

    /**
     * ➕ Crea un nuovo utente nel database.
     * @param email - indirizzo email dell’utente
     * @param passwordHash - password già cifrata (hashata)
     * @param initialTokens - numero di token iniziali assegnati
     * @returns `GraphUser` appena creato
     */
    create(email: string, passwordHash: string, initialTokens: number): Promise<GraphUser>;

    /**
     * 💰 Aggiorna il saldo token di un utente dato l’email.
     * @param email - indirizzo email dell’utente target
     * @param newBalance - nuovo saldo di token
     * @param performerId - id dell’admin/utente che effettua l’operazione
     * @param reason - motivo della ricarica (opzionale, es. "admin recharge")
     * @returns Oggetto con email, token precedenti, nuovi token e differenza
     */
    updateBalanceByEmail(
        email: string,
        newBalance: number,
        performerId: string,
        reason?: string
    ): Promise<{ email: string; previousTokens: number; newTokens: number; diff: number }>;
}
