import bcrypt from "bcrypt";
import logger from "@/config/logger";

/**
 * PasswordHasher (Interface)
 *
 * Description:
 * - Defines a contract for password hashing strategies.
 * - Allows swapping the algorithm (e.g., bcrypt, argon2, or a mock for testing)
 *   without changing the rest of the application.
 *
 * Methods:
 * - `hash(plain)` → generates a secure hash from a plain text password.
 * - `compare(plain, hashed)` → compares a plain text password with its hashed version.
 */
export interface PasswordHasher {
  /**
   * hash
   *
   * Description:
   * - Generates a hashed password using the chosen algorithm.
   *
   * @param plain {string} - Plain text password provided by the user.
   * @returns {Promise<string>} - The hashed password string.
   */
  hash(plain: string): Promise<string>;

  /**
   * compare
   *
   * Description:
   * - Compares a plain text password against a hashed password.
   *
   * @param plain {string} - Plain text password to check.
   * @param hashed {string} - Hashed password stored in the database.
   * @returns {Promise<boolean>} - True if passwords match, false otherwise.
   */
  compare(plain: string, hashed: string): Promise<boolean>;
}

/**
 * BcryptPasswordHasher
 *
 * Description:
 * - Concrete implementation of the `PasswordHasher` interface using bcrypt.
 * - Encapsulates hashing and comparison logic with configurable salt rounds.
 *
 * Objective:
 * - Provide secure password hashing and verification for authentication workflows.
 */
export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly saltRounds: number) {}

  /**
   * hash
   *
   * Description:
   * - Hashes a plain text password using bcrypt.
   *
   * @param plain {string} - The plain text password to hash.
   * @returns {Promise<string>} - The resulting hashed password.
   */
  async hash(plain: string): Promise<string> {
    logger.debug("[BcryptPasswordHasher] Hashing password with bcrypt", {
      saltRounds: this.saltRounds,
    });
    try {
      const hashed = await bcrypt.hash(plain, this.saltRounds);
      logger.info("[BcryptPasswordHasher] Password hashed successfully");
      return hashed;
    } catch (error: any) {
      logger.error("[BcryptPasswordHasher] Error hashing password", {
        error: error?.message,
      });
      throw error;
    }
  }

  /**
   * compare
   *
   * Description:
   * - Compares a plain text password with a hashed password.
   *
   * @param plain {string} - The plain text password to validate.
   * @param hashed {string} - The hashed password stored in the system.
   * @returns {Promise<boolean>} - True if the passwords match, false otherwise.
   */
  async compare(plain: string, hashed: string): Promise<boolean> {
    logger.debug("[BcryptPasswordHasher] Comparing passwords");
    try {
      const isMatch = await bcrypt.compare(plain, hashed);
      logger.info("[BcryptPasswordHasher] Password comparison result", {
        isMatch,
      });
      return isMatch;
    } catch (error: any) {
      logger.error("[BcryptPasswordHasher] Error comparing passwords", {
        error: error?.message,
      });
      throw error;
    }
  }
}
