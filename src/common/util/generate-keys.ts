import { generateKeyPairSync } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import logger from "@/config/logger";

/**
 * RSA Key Management Script
 *
 * Description:
 * Provides functions to generate and verify the existence of RSA public and private
 * keys used for JWT authentication. Keys are stored in the ./keys directory.
 * This module can be executed directly or imported and used during application startup.
 */

/**
 * generateKeys
 *
 * Description:
 * Generates a new RSA key pair for JWT authentication and stores them on disk.
 * If keys already exist and the force option is not enabled, existing keys are reused.
 *
 * Objective:
 * - Ensure the keys directory exists.
 * - Generate a 4096-bit RSA key pair if required.
 * - Write the keys to disk with secure file permissions.
 *
 * Parameters:
 * @param forceGen {boolean} - If true, forces regeneration of keys even if they exist.
 *
 * Returns:
 * @returns {Object} - Paths to the private and public key files.
 */
export function generateKeys(forceGen: boolean = false) {
  const keysDir = "./keys";
  const privateKeyPath = join(keysDir, "private.key");
  const publicKeyPath = join(keysDir, "public.key");
  const force = forceGen;

  if (!existsSync(keysDir)) {
    logger.info(`Keys directory not found, creating ${keysDir}`);
    mkdirSync(keysDir, { recursive: true });
  }

  const keysExist = existsSync(privateKeyPath) && existsSync(publicKeyPath);

  if (keysExist && !force) {
    logger.info("RSA keys already exist, skipping generation");
    return { privateKeyPath, publicKeyPath };
  }

  try {
    logger.info("Generating new RSA key pair");
    const { privateKey, publicKey } = generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
    writeFileSync(publicKeyPath, publicKey);

    logger.info(`RSA keys generated successfully in ${keysDir}`);
    return { privateKeyPath, publicKeyPath };
  } catch (error) {
    logger.error("Error occurred while generating RSA keys");
    throw error;
  }
}

/**
 * ensureKeysExist
 *
 * Description:
 * Ensures that RSA keys are available by checking if they exist
 * and generating them if necessary. Called during application startup.
 *
 * Returns:
 * @returns {Object} - Paths to the private and public key files.
 */
export function ensureKeysExist(): {
  privateKeyPath: string;
  publicKeyPath: string;
} {
  try {
    logger.info("Checking RSA keys");
    return generateKeys();
  } catch (error) {
    logger.error("Error ensuring RSA keys");
    throw error;
  }
}

/**
 * Script Execution
 *
 * Description:
 * If this script is run directly with Node.js, it will generate the keys.
 * You can pass the --force flag to regenerate them even if they exist.
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  if (force) {
    logger.info("Forcing RSA keys generation");
  }

  try {
    const { privateKeyPath, publicKeyPath } = generateKeys(force);
    logger.info(`Private key path: ${privateKeyPath}`);
    logger.info(`Public key path: ${publicKeyPath}`);
    process.exit(0);
  } catch {
    process.exit(1);
  }
}
