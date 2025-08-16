import "express";
import type { UserPayloadTypeSafe } from "@/common/types";

/**
 * 📌 Estensione dei tipi Express
 *
 * Descrizione:
 * - Questo file serve per "augmentare" i tipi di Express tramite `declare module`.
 * - In particolare, aggiungiamo la proprietà opzionale `user` all’oggetto `Request`.
 * - `req.user` viene popolato dal middleware di autenticazione JWT, che decodifica il token
 *   e inserisce un `UserPayloadTypeSafe` (id, email, ruolo, token, ecc.).
 *
 * Vantaggi:
 * - Tipizzazione sicura: nei controller `req.user` ha completamento automatico e tipi corretti.
 * - Elimina l’uso di `any` o casting manuale.
 *
 * Flusso:
 * 1. Middleware JWT → decodifica il token.
 * 2. Inserisce `req.user = payload`.
 * 3. Controller/Service possono usare `req.user` con type-safety.
 */
declare module "express-serve-static-core" {
    interface Request {
        user?: UserPayloadTypeSafe; // presente solo se autenticato
    }
}
