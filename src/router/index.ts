// src/router/index.ts
import { Router } from 'express';
import authRouter from './auth.router';
import userRouter from './user.router';

/**
 * 🧭 Router principale API
 *
 * Descrizione generale:
 * - Punto di aggregazione dei vari sotto-router dell’applicazione.
 * - Ogni gruppo di rotte viene montato con un prefisso specifico.
 *
 * Flusso:
 * 1. Le richieste che iniziano con `/auth` vengono gestite da `authRouter`.
 * 2. Le richieste che iniziano con `/users` vengono gestite da `userRouter`.
 * 3. In futuro si possono aggiungere altri sotto-router (es. `/models`, `/graphs`, ecc.).
 */

const api = Router();

// 🔐 Rotte di autenticazione (registrazione, login)
api.use('/auth', authRouter);

// 👤 Rotte utente (profilo, ricarica token, ecc.)
api.use('/users', userRouter);

export default api;
