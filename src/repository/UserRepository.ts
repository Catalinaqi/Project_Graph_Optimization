import type { IUserRepository } from './repository-interface/IUserRepository';
import UserDao from '@/dao/UserDao';
import logger from '@/config/logger';

/**
 * 🗄️ UserRepository
 *
 * Descrizione generale:
 * - Implementa l’interfaccia `IUserRepository` per gestire le operazioni di accesso ai dati utente.
 * - Funziona come livello intermedio tra i servizi (`UserService`, `AuthService`) e il DAO.
 * - Incapsula la logica di logging e validazione di base.
 *
 * Operazioni principali:
 *   🔹 Recupero utente per email o id
 *   🔹 Creazione di un nuovo utente
 *   🔹 Aggiornamento del saldo token con audit
 */
const UserRepository: IUserRepository = {
    /**
     * 🔎 getByEmail(email)
     * - Recupera un utente a partire dall’indirizzo email.
     * - Logga l’operazione prima di delegare a `UserDao.findByEmail`.
     */
    getByEmail(email) {
        logger.debug(`[UserRepository] getByEmail email=${email}`);
        return UserDao.findByEmail(email);
    },

    /**
     * 🔎 getById(id)
     * - Recupera un utente a partire dall’id univoco.
     * - Logga l’operazione prima di delegare a `UserDao.findById`.
     */
    getById(id) {
        logger.debug(`[UserRepository] getById id=${id}`);
        return UserDao.findById(id);
    },

    /**
     * ➕ create(email, passwordHash, initialTokens)
     * - Crea un nuovo utente con ruolo predefinito `user`.
     * - Salva email, password cifrata e saldo iniziale.
     * - Logga l’operazione prima di delegare a `UserDao.createUser`.
     */
    async create(email, passwordHash, initialTokens) {
        logger.debug(`[UserRepository] create email=${email}`);
        return UserDao.createUser({
            email_user: email,
            password_user: passwordHash,
            role_user: 'user',
            tokens_user: initialTokens.toFixed(2),
        });
    },

    /**
     * 💰 updateBalanceByEmail(email, newBalance, performerId, reason?)
     * - Aggiorna il saldo token di un utente dato l’email.
     * - Flusso:
     *   1. Recupera l’utente target tramite `UserDao.findByEmail`.
     *   2. Se non trovato → errore 404.
     *   3. Altrimenti invoca `UserDao.setNewBalance` per aggiornare il saldo,
     *      registrando anche l’id dell’admin che effettua la ricarica e la motivazione.
     *   4. Restituisce email utente + dati transazione aggiornati.
     */
    async updateBalanceByEmail(email, newBalance, performerId, reason) {
        logger.debug(`[UserRepository] updateBalanceByEmail email=${email}, newBalance=${newBalance}`);
        const user = await UserDao.findByEmail(email);
        if (!user) {
            const err: any = new Error('Target user not found');
            err.status = 404; throw err;
        }
        const tx = await UserDao.setNewBalance(user.id_user, newBalance, performerId, reason ?? 'admin recharge');
        return { email: user.email_user, ...tx };
    },
};

export default UserRepository;
