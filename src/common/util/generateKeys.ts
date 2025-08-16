import {generateKeyPairSync} from "crypto";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {join} from "path";
import logger from "@/config/logger";

/**
 * Script that generates public and private keys for JWT authentication using RSA
 * Automatically runs in Docker container during startup
 */

/**
 * Generates RSA key pair for JWT authentication
 * @returns Object containing paths to the generated keys
 */
export function generateKeys(forceGen: boolean = false) {
    // Get configuration from options or environment variables
    const keysDir = "./keys";
    const privateKeyPath = join(keysDir, "private.key");
    const publicKeyPath = join(keysDir, "public.key");
    const force = forceGen;

    // Create keys directory if it doesn't exist
    if (!existsSync(keysDir)) {
        logger.info(`Keys directory not found - creating ${keysDir}`);
        try {
            mkdirSync(keysDir, {recursive: true});
        } catch (error) {
            throw error;
        }
    }

    // Check if keys already exist
    const keysExist = existsSync(privateKeyPath) && existsSync(publicKeyPath);

    if (keysExist && !force) {
        logger.info("RSA keys already exist - skipping generation");
        return {privateKeyPath, publicKeyPath};
    }

    try {
        logger.info("Generating new RSA key pair...");
        const {privateKey, publicKey} = generateKeyPairSync("rsa", {
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

        // Write keys to files with appropriate permissions
        writeFileSync(privateKeyPath, privateKey, {mode: 0o600}); // More restrictive permissions for private key
        writeFileSync(publicKeyPath, publicKey);

        logger.info(`RSA keys generated successfully at ${keysDir}`);
        return {privateKeyPath, publicKeyPath};
    } catch (error) {
        throw error;
    }
}

/**
 * Check and generate keys if needed
 * This function is called during application startup
 */
export function ensureKeysExist(): {
    privateKeyPath: string;
    publicKeyPath: string;
} {
    try {
        logger.info("Checking for RSA keys...");
        return generateKeys();
    } catch (error) {
        throw error;
    }
}

// Execute if this script is run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const force = args.includes("--force");

    if (force) {
        logger.info("Forcing generation of RSA keys");
    }

    try {
        const {privateKeyPath, publicKeyPath} = generateKeys(force);
        logger.info(`Private key: ${privateKeyPath}`);
        logger.info(`Public key: ${publicKeyPath}`);
        process.exit(0);
    } catch {
        process.exit(1);
    }
}
