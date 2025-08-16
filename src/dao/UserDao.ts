import type { IUserDao } from './dao-interface/IUserDao';
import { GraphUser } from '@/model/GraphUser';
import { GraphTokenTransaction } from '@/model/GraphTokenTransaction';
import logger from '@/config/logger';

/**
 * 🗄️ UserDao
 *
 * Descrizione generale:
 * - Implementa l’interfaccia `IUserDao` per l’accesso diretto ai dati utente nel database.
 * - Usa i modelli Sequelize (`GraphUser`, `GraphTokenTransaction`) per interagire con le tabelle.
 * - È il livello più vicino al DB: nessuna logica di business, solo query e persistenza.
 */
const UserDao: IUserDao = {
    /**
     * 🔎 findByEmail(email)
     * - Cerca un utente nel DB a partire dall’email.
     * - Usa `GraphUser.findOne` con condizione su `email_user`.
     */
    findByEmail(email) {
        logger.debug(`[UserDao] findByEmail email=${email}`);
        return GraphUser.findOne({ where: { email_user: email } });
    },

    /**
     * 🔎 findById(id)
     * - Recupera un utente tramite chiave primaria.
     * - Usa `GraphUser.findByPk`.
     */
    findById(id) {
        logger.debug(`[UserDao] findById id=${id}`);
        return GraphUser.findByPk(id);
    },

    /**
     * ➕ createUser(data)
     * - Inserisce un nuovo utente nella tabella `GraphUser`.
     * - Accetta un oggetto con campi coerenti al modello (email, password, role, tokens).
     */
    createUser(data) {
        logger.debug(`[UserDao] createUser email=${data.email_user}`);
        return GraphUser.create(data as any);
    },

    /**
     * 💰 setNewBalance(userId, newBalance, performerId, reason)
     * - Aggiorna il saldo dei token di un utente e registra una transazione di audit.
     *
     * Flusso:
     * 1. Recupera l’utente da `GraphUser.findByPk`.
     *    - Se non esiste → log warn e lancia errore 404.
     * 2. Calcola saldo precedente (`prev`) e nuovo (`next`), arrotondati a 2 decimali.
     * 3. Aggiorna il record utente con il nuovo saldo token.
     * 4. Inserisce un record in `GraphTokenTransaction` con i dettagli:
     *    - id utente, id admin che ha fatto l’operazione
     *    - saldo precedente, saldo nuovo, differenza, motivazione
     * 5. Restituisce oggetto con `previousTokens`, `newTokens`, `diff`.
     */
    async setNewBalance(userId, newBalance, performerId, reason) {
        logger.debug(`[UserDao] setNewBalance userId=${userId}, newBalance=${newBalance}`);
        const user = await GraphUser.findByPk(userId);
        if (!user) {
            logger.warn('[UserDao] Utente non trovato per setNewBalance');
            const err: any = new Error('User not found');
            err.status = 404;
            throw err;
        }
        const prev = Number(user.tokens_user);
        const next = Number(newBalance.toFixed(2));

        await user.update({ tokens_user: next.toFixed(2) });

        await GraphTokenTransaction.create({
            id_user: userId,
            id_performer_user: performerId,
            prev_tokens_token_transaction: prev.toFixed(2),
            new_tokens_token_transaction: next.toFixed(2),
            diff_tokens_token_transaction: (next - prev).toFixed(2),
            reason_token_transaction: reason,
        } as any);

        return { previousTokens: prev, newTokens: next, diff: next - prev };
    },
};

export default UserDao;
