import bcrypt from "bcrypt";

/**
 * 🔑 Interfaccia PasswordHasher
 *
 * Descrizione:
 * - Definisce un contratto per le strategie di hashing delle password.
 * - Permette di cambiare facilmente l’algoritmo (es. bcrypt, argon2, mock per i test)
 *   senza modificare il resto del codice.
 *
 * Metodi:
 * - `hash(plain)` → genera l’hash sicuro a partire da una password in chiaro.
 * - `compare(plain, hashed)` → confronta una password in chiaro con il suo hash.
 */
export interface PasswordHasher {
    hash(plain: string): Promise<string>;
    compare(plain: string, hashed: string): Promise<boolean>;
}

/**
 * 🧩 Implementazione di PasswordHasher con bcrypt
 *
 * Descrizione:
 * - Usa la libreria `bcrypt` per effettuare l’hashing e la verifica delle password.
 * - Parametrizza il numero di `saltRounds` (definito in `.env` tramite `enviroment.saltRounds`).
 *
 * Flusso:
 * 1. `hash(plain)` → applica bcrypt con il numero di round specificato.
 * 2. `compare(plain, hashed)` → confronta la password inserita dall’utente
 *    con l’hash salvato nel database.
 */
export class BcryptPasswordHasher implements PasswordHasher {
    constructor(private readonly saltRounds: number) {}

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.saltRounds);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
