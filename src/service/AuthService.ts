import logger from '@/config/logger';
import environment from '@/config/enviroment';
import UserRepository from '@/repository/UserRepository';
import { SecurityFactory } from '@/common/security/security.factory';

const hasher = SecurityFactory.makePasswordHasher();
const jwt    = SecurityFactory.makeJwtStrategy();

/**
 * 🔐 AuthService (Façade Service)
 *
 * Descrizione generale:
 * - Fornisce un punto unico (façade) per la logica di autenticazione e registrazione utenti.
 * - Si appoggia a:
 *   🔹 UserRepository → per interagire con il database utenti
 *   🔹 PasswordHasher (bcrypt) → per cifrare/verificare le password
 *   🔹 JwtStrategy (RS256) → per generare e validare i JWT
 */
const AuthService = {
    /**
     * 📌 register(email, password)
     * - Registra un nuovo utente standard.
     *
     * Flusso:
     * 1. Logga l’avvio della registrazione.
     * 2. Verifica se esiste già un utente con la stessa email:
     *    - se sì → lancia errore 409 (Conflict).
     * 3. Genera l’hash sicuro della password tramite `PasswordHasher`.
     * 4. Crea un nuovo record utente nel DB con `initUserTokens` come saldo iniziale.
     * 5. Logga il completamento della registrazione.
     * 6. Restituisce i dati principali dell’utente creato (id, email).
     */
    async register(email: string, password: string) {
        logger.info('[AuthService] Registrazione utente avviata');
        const exists = await UserRepository.getByEmail(email);
        if (exists) {
            const err: any = new Error('Email already registered');
            err.status = 409;
            throw err;
        }
        const hash = await hasher.hash(password);
        const user = await UserRepository.create(email, hash, environment.initUserTokens ?? 0);
        logger.info('[AuthService] Registrazione completata');
        return { id: user.id_user, email: user.email_user };
    },

    /**
     * 📌 login(email, password)
     * - Autentica un utente esistente e genera un JWT.
     *
     * Flusso:
     * 1. Logga l’avvio del login.
     * 2. Recupera l’utente dal DB tramite email.
     * 3. Verifica che l’utente esista e che la password sia corretta:
     *    - se fallisce → lancia errore 401 (Unauthorized).
     * 4. Genera un token JWT firmato (RS256) con payload: id, email, ruolo.
     * 5. Logga il completamento del login.
     * 6. Restituisce il token e la durata di validità (`expiresIn`).
     */
    async login(email: string, password: string) {
        logger.info('[AuthService] Login utente avviato');
        const user = await UserRepository.getByEmail(email);
        if (!user || !(await hasher.compare(password, user.password_user))) {
            const err: any = new Error('Invalid credentials');
            err.status = 401;
            throw err;
        }
        const token = jwt.sign({ id: user.id_user, email: user.email_user, role: user.role_user });
        logger.info('[AuthService] Login completato');
        return { token, expiresIn: process.env.JWT_EXPIRES_IN ?? '3600' };
    },
};

export default AuthService;
