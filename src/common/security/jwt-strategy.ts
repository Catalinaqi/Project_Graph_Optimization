import type { UserPayloadTypeSafe } from "@/common/types";
import JwtUtils from "@/common/util/jwt.util";
import logger from "@/config/logger";

/**
 * JwtStrategy
 *
 * Description:
 * Defines the contract for all JWT strategies.
 * Allows multiple implementations (RS256, HS256, mock for tests) without
 * changing the rest of the application.
 *
 * Methods:
 * - sign(payload): generates a JWT token from a user payload.
 * - verify(token): validates a JWT token and returns the decoded payload.
 */
export interface JwtStrategy {
  sign(payload: Omit<UserPayloadTypeSafe, "iat" | "exp">): string;
  verify(token: string): UserPayloadTypeSafe;
}

/**
 * RS256JwtStrategy
 *
 * Description:
 * Concrete implementation of JwtStrategy using the RS256 algorithm.
 *
 * Objective:
 * - Delegate signing and verification to JwtUtils.
 * - Encapsulate the logic so that changing algorithms requires only
 *   creating a new class implementing JwtStrategy.
 *
 * Methods:
 * - sign(payload): signs a user payload with the private key.
 * - verify(token): verifies the JWT token using the public key.
 */
export class RS256JwtStrategy implements JwtStrategy {
  /**
   * sign
   *
   * Description:
   * Generates a JWT token from a user payload.
   *
   * Parameters:
   * @param payload {Omit<UserPayloadTypeSafe, "iat" | "exp">} - The user payload without issued-at and expiry claims.
   *
   * Returns:
   * @returns {string} - A signed JWT token.
   */
  sign(payload: Omit<UserPayloadTypeSafe, "iat" | "exp">): string {
    try {
      logger.debug("[RS256JwtStrategy] Signing JWT token", {
        userId: payload.id,
      });
      const token = JwtUtils.generateToken(payload as any);
      logger.info("[RS256JwtStrategy] JWT token successfully signed", {
        userId: payload.id,
      });
      return token;
    } catch (error: any) {
      logger.error("[RS256JwtStrategy] Failed to sign JWT token", {
        error: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  }

  /**
   * verify
   *
   * Description:
   * Validates a JWT token and returns the decoded user payload.
   *
   * Parameters:
   * @param token {string} - The JWT token to verify.
   *
   * Returns:
   * @returns {UserPayloadTypeSafe} - The decoded user payload if the token is valid.
   */
  verify(token: string): UserPayloadTypeSafe {
    try {
      logger.debug("[RS256JwtStrategy] Verifying JWT token");
      const payload = JwtUtils.verifyToken(token) as UserPayloadTypeSafe;
      logger.info("[RS256JwtStrategy] JWT token successfully verified", {
        userId: payload.id,
      });
      return payload;
    } catch (error: any) {
      logger.error("[RS256JwtStrategy] Failed to verify JWT token", {
        error: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  }
}
