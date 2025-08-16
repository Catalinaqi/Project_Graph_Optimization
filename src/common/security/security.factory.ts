// import environment from "@/config/enviroment";
import { BcryptPasswordHasher, PasswordHasher } from "./password.strategy";
import { JwtStrategy, RS256JwtStrategy } from "./jwt.strategy";

/**
 * 🏭 SecurityFactory
 *
 * Descrizione:
 * - Implementa il **Factory Method Pattern** per creare oggetti legati alla sicurezza.
 * - Centralizza la logica di istanziazione così i servizi non hanno dipendenze dirette
 *   da implementazioni concrete (es. bcrypt, RS256).
 * - Se un domani vuoi cambiare algoritmo (es. Argon2 invece di bcrypt, HS256 invece di RS256),
 *   basta modificare qui, senza toccare controller o servizi.
 */
export class SecurityFactory {
    /**
     * 🔑 Factory Method: PasswordHasher
     *
     * Flusso:
     * 1. Recupera il numero di `saltRounds` dalle variabili d’ambiente
     *    (`SALT_ROUNDS`, default 12).
     * 2. Restituisce un’istanza di `BcryptPasswordHasher`.
     *
     * 👉 Vantaggio: puoi sostituire bcrypt con Argon2 o un mock per i test senza
     *    modificare il resto dell’applicazione.
     */
    static makePasswordHasher(): PasswordHasher {
        const rounds = Number(process.env.SALT_ROUNDS ?? 12);
        return new BcryptPasswordHasher(rounds);
    }

    /**
     * 🔐 Factory Method: JwtStrategy
     *
     * Flusso:
     * 1. Oggi restituisce sempre una `RS256JwtStrategy` (firma con chiavi private/public).
     * 2. Domani puoi aggiungere uno switch basato su `environment.jwtAlgorithm`
     *    per supportare algoritmi diversi (es. HS256).
     *
     * 👉 Vantaggio: decoupling → i servizi che usano JWT dipendono solo da `JwtStrategy`,
     *    non da un’implementazione concreta.
     */
    static makeJwtStrategy(): JwtStrategy {
        // Esempio evolutivo:
        // if (environment.jwtAlgorithm === "HS256") return new HS256JwtStrategy();
        return new RS256JwtStrategy();
    }
}
