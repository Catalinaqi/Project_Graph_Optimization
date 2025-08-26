import { Router } from 'express';
import authRouter from './auth.router';
import userRouter from './user.router';
import modelsRouter from './models.router';

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

/** 🔐 Rutas de autenticación (registro, login, etc.) */
api.use("/auth", authRouter);

/** 🧑 Rutas de usuario (perfil, recarga, etc.) */
api.use("/users", userRouter);

/** 🧠 Rutas de modelos de grafo */
api.use("/models", modelsRouter);



export default api;
