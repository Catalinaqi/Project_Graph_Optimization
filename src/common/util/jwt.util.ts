import fs from "fs";
import path from "path";
import jwt, { Algorithm, JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";

import environment from "@/config/enviroment";
import logger from "@/config/logger";

import { ErrorEnum } from "@/common/enums";
import { getError } from "@/common/util/api.error.util";
import type { UserPayloadTypeSafe } from "@/common/types";

/**
 * JwtUtils
 *
 * Description:
 * Utility class that manages the creation and verification of JWT tokens
 * using the RS256 algorithm.
 *
 * Objective:
 * - Load private and public keys either from files or from inline environment variables.
 * - Generate signed JWT tokens for authenticated users.
 * - Verify and decode JWT tokens using the public key.
 * - Map library-level JWT errors to application-level error enums.
 */
export default class JwtUtils {
    /**
     * readKey
     *
     * Description:
     * Loads a private or public key from either an inline PEM string or a file path.
     *
     * Objective:
     * - Accept keys directly via environment variables or from a file.
     * - Validate that the key is non-empty and in PEM format.
     *
     * Parameters:
     * @param source {string | undefined} - Inline PEM string or file path.
     * @param label {"private" | "public"} - Type of key being loaded.
     *
     * Returns:
     * @returns {string} - A valid PEM-formatted key.
     */
    private static readKey(source: string | undefined, label: "private" | "public"): string {
        if (!source || !source.trim()) {
            throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key path/content not provided`);
        }

        // Inline PEM case
        if (source.includes("BEGIN")) {
            const pem = source.replace(/\\n/g, "\n").trim();
            if (!pem) {
                throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key (inline) is empty`);
            }
            logger.debug({
                message: `[JwtUtils] ${label} key loaded from environment (inline)`,
                meta: { bytes: pem.length },
            });
            return pem;
        }

        // File path case
        const abs = path.isAbsolute(source) ? source : path.resolve(process.cwd(), source);
        if (!fs.existsSync(abs)) {
            throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key file not found at: ${abs}`);
        }
        const pem = fs.readFileSync(abs, "utf8").trim();
        if (!pem) {
            throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key file is empty at: ${abs}`);
        }
        if (!pem.includes("BEGIN")) {
            throw getError(ErrorEnum.SERVER_ERROR, `[JWT] ${label} key at ${abs} is not a valid PEM`);
        }
        logger.debug({
            message: `[JwtUtils] ${label} key loaded from file`,
            meta: { path: abs, bytes: pem.length },
        });
        return pem;
    }

    /**
     * Global configuration values loaded from environment.
     */
    private static readonly algorithm: Algorithm = (environment.jwtAlgorithm as Algorithm) || "RS256";
    private static readonly privateKey: string = JwtUtils.readKey(environment.jwtPrivateKeyPath, "private");
    private static readonly publicKey: string = JwtUtils.readKey(environment.jwtPublicKeyPath, "public");
    private static readonly expiresIn: number = Number(environment.jwtExpiresIn || 3600);

    /**
     * generateToken
     *
     * Description:
     * Generates a signed JWT token for a user.
     *
     * Objective:
     * - Sign the provided payload with the private key.
     * - Apply standard options such as algorithm, expiration, issuer, and audience.
     *
     * Parameters:
     * @param payload {UserPayloadTypeSafe} - The user data to embed in the JWT payload.
     *
     * Returns:
     * @returns {string} - A signed JWT token.
     */
    static generateToken(payload: UserPayloadTypeSafe): string {
        try {
            logger.debug({
                message: "[JwtUtils] Generating JWT token",
                meta: { payload: { ...payload, iat: undefined, exp: undefined } },
            });
            const opts: SignOptions = {
                algorithm: this.algorithm,
                expiresIn: this.expiresIn,
                issuer: environment.jwtIssuer || undefined,
                audience: environment.jwtAudience || undefined,
            };
            return jwt.sign(payload as any, this.privateKey, opts);
        } catch (err: any) {
            logger.error({
                message: "[JwtUtils] Error generating token",
                meta: { err: err?.message },
            });
            throw getError(ErrorEnum.SERVER_ERROR, err?.message || "JWT sign failed");
        }
    }

    /**
     * verifyToken
     *
     * Description:
     * Verifies a JWT token and returns the decoded payload.
     *
     * Objective:
     * - Validate the token signature with the public key.
     * - Ensure the token payload is an object and not a string.
     * - Map library errors (e.g., expiration, invalid signature) to application errors.
     *
     * Parameters:
     * @param token {string} - The JWT token to verify.
     *
     * Returns:
     * @returns {UserPayloadTypeSafe & JwtPayload} - The decoded payload.
     */
    static verifyToken(token: string): UserPayloadTypeSafe & JwtPayload {
        try {
            logger.debug({
                message: "[JwtUtils] Starting token verification",
                meta: { tokenLength: token?.length },
            });

            const opts: VerifyOptions = {
                algorithms: [this.algorithm],
                issuer: environment.jwtIssuer || undefined,
                audience: environment.jwtAudience || undefined,
            };

            logger.debug({
                message: "[JwtUtils] Applying verification options",
                meta: opts,
            });

            const decoded = jwt.verify(token, this.publicKey, opts) as JwtPayload;

            logger.debug({
                message: "[JwtUtils] Token successfully decoded",
                meta: { rawType: typeof decoded },
            });

            if (typeof decoded === "string") {
                logger.error({
                    message: "[JwtUtils] Invalid token format: string payload",
                    meta: { decoded },
                });
                throw getError(ErrorEnum.INVALID_JWT_FORMAT, "JWT payload is a string, expected object");
            }

            logger.debug({
                message: "[JwtUtils] Token payload validated",
                meta: { sub: decoded.sub, exp: decoded.exp, iat: decoded.iat },
            });

            return decoded as UserPayloadTypeSafe & JwtPayload;
        } catch (err: any) {
            const name = err?.name;
            const msg = err?.message || "JWT verify failed";

            logger.error({
                message: "[JwtUtils] Error during token verification",
                meta: { errorName: name, errorMessage: msg },
            });

            if (name === "TokenExpiredError") {
                throw getError(ErrorEnum.JWT_EXPIRED, msg);
            }
            if (name === "JsonWebTokenError") {
                throw getError(ErrorEnum.INVALID_JWT_SIGNATURE, msg);
            }
            if (name === "NotBeforeError") {
                throw getError(ErrorEnum.JWT_NOT_ACTIVE, msg);
            }

            throw getError(ErrorEnum.SERVER_ERROR, msg);
        }
    }

}
