import logger from '@/config/logger';
import UserRepository from '@/repository/UserRepository';

/**
 * 👤 UserService (Façade Service)
 *
 * Descrizione generale:
 * - Fornisce i metodi di business legati agli utenti.
 * - Funziona come “façade” tra controller e repository, incapsulando la logica applicativa.
 * - Operazioni principali:
 *   🔹 Recupero profilo utente autenticato
 *   🔹 Ricarica del saldo token da parte di un admin
 */
const UserService = {
    /**
     * 📌 me(userId)
     * - Recupera il profilo dell’utente dato l’id.
     *
     * Flusso:
     * 1. Logga l’avvio del recupero profilo.
     * 2. Usa `UserRepository.getById` per cercare l’utente.
     * 3. Se non trovato → lancia errore 404 (User not found).
     * 4. Se trovato → restituisce un oggetto con id, email, ruolo e token disponibili.
     */
    async me(userId: string) {
        logger.debug('[UserService] Recupero profilo utente');
        const u = await UserRepository.getById(userId);
        if (!u) {
            const err: any = new Error('User not found');
            err.status = 404;
            throw err;
        }
        return { id: u.id_user, email: u.email_user, role: u.role_user, tokens: Number(u.tokens_user) };
    },

    /**
     * 📌 adminRecharge(targetEmail, newBalance, performerId, reason?)
     * - Permette a un admin di ricaricare i token di un utente.
     *
     * Flusso:
     * 1. Logga l’avvio dell’operazione di ricarica.
     * 2. Usa `UserRepository.updateBalanceByEmail` per aggiornare il saldo dell’utente target.
     *    - Registra anche l’id di chi ha effettuato l’operazione (audit).
     *    - Può includere una motivazione (`reason`).
     * 3. Logga il completamento della ricarica.
     * 4. Restituisce i dati aggiornati con timestamp `updatedAt`.
     */
    async adminRecharge(targetEmail: string, newBalance: number, performerId: string, reason?: string) {
        logger.info('[UserService] Ricarica admin avviata');
        const out = await UserRepository.updateBalanceByEmail(targetEmail, newBalance, performerId, reason);
        logger.info('[UserService] Ricarica admin completata');
        return { ...out, updatedAt: new Date().toISOString() };
    },
};

export default UserService;
