import environment from "@/config/enviroment";
import { BcryptPasswordHasher, PasswordHasher } from "./password.strategy";
import { JwtStrategy, RS256JwtStrategy } from "./jwt.strategy";
import logger from "@/config/logger";

/**
 * SecurityFactory
 *
 * Description:
 * Implements the Factory Method Pattern to create security-related objects.
 *
 * Objective:
 * - Centralize the instantiation of security strategies (password hashing, JWT).
 * - Decouple services from concrete implementations (e.g., bcrypt vs Argon2, RS256 vs HS256).
 * - Allow easy replacement of algorithms without modifying controllers or services.
 */
export class SecurityFactory {
    /**
     * makePasswordHasher
     *
     * Description:
     * Factory method that creates a password hasher implementation.
     *
     * Objective:
     * - Retrieve the number of salt rounds from the environment variable `SALT_ROUNDS`.
     * - Return an instance of `BcryptPasswordHasher` configured with the chosen salt rounds.
     * - Allow future replacement with other algorithms such as Argon2 or a mock hasher for testing.
     *
     * Returns:
     * @returns {PasswordHasher} - A password hasher implementation.
     */
    static makePasswordHasher(): PasswordHasher {
        try {
            const rounds = Number(environment.saltRounds ?? 12);
            logger.info("[SecurityFactory] Creating PasswordHasher with bcrypt", { saltRounds: rounds });
            return new BcryptPasswordHasher(rounds);
        } catch (error: any) {
            logger.error("[SecurityFactory] Failed to create PasswordHasher", {
                error: error?.message,
                stack: error?.stack,
            });
            throw error;
        }
    }

    /**
     * makeJwtStrategy
     *
     * Description:
     * Factory method that creates a JWT strategy implementation.
     *
     * Objective:
     * - Currently returns an instance of `RS256JwtStrategy` for asymmetric signing.
     * - Can be extended in the future to select strategies dynamically (e.g., RS256, HS256)
     *   based on environment configuration.
     *
     * Returns:
     * @returns {JwtStrategy} - A JWT strategy implementation.
     */
    static makeJwtStrategy(): JwtStrategy {
        try {
            logger.info("[SecurityFactory] Creating JWT strategy with RS256");
            // Example of a possible evolution:
            // if (environment.jwtAlgorithm === "HS256") return new HS256JwtStrategy();
            return new RS256JwtStrategy();
        } catch (error: any) {
            logger.error("[SecurityFactory] Failed to create JWT strategy", {
                error: error?.message,
                stack: error?.stack,
            });
            throw error;
        }
    }
}
