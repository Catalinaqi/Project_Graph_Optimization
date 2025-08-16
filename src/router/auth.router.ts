import { Router } from 'express';
import { AuthController } from '@/controller/auth.controller';

/**
 * 🔐 Router: rotte di autenticazione
 *
 * Descrizione generale:
 * - Gestisce la registrazione e il login degli utenti.
 * - Non richiede autenticazione JWT, poiché sono le rotte di ingresso al sistema.
 */

const router = Router();

/**
 * POST /auth/register
 * - Registra un nuovo utente.
 * - Flusso:
 *   1. Il client invia email, password e altri dati necessari.
 *   2. `AuthController.register` valida i dati e crea un nuovo record utente nel DB.
 *   3. In risposta viene restituito l’utente registrato e/o un token di accesso iniziale.
 */
router.post('/register', AuthController.register);

/**
 * POST /auth/login
 * - Esegue l’autenticazione di un utente esistente.
 * - Flusso:
 *   1. Il client invia email e password.
 *   2. `AuthController.login` verifica le credenziali.
 *   3. Se valide, ritorna un JWT firmato contenente le informazioni dell’utente (payload).
 *   4. Se non valide, viene restituito un errore di autenticazione.
 */
router.post('/login', AuthController.login);

export default router;
