import { NextFunction, Request, Response } from "express";
import logger from "@/config/logger";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";
import { UserPayloadTypeSafe } from "@/common/types";
import { SecurityFactory } from "@/common/security/security-factory";

const jwt = SecurityFactory.makeJwtStrategy();

/**
 * authenticationMiddleware
 *
 * Description:
 * Express middleware that authenticates requests using a JWT provided in the
 * Authorization header. If the token is valid, the decoded payload is attached
 * to `req.user` and the request proceeds. Otherwise, a standardized unauthorized
 * error is forwarded to the error handler.
 *
 * Objective:
 * - Validate presence and format of the Authorization header.
 * - Verify the JWT using the configured strategy.
 * - Attach the decoded user payload to the request object.
 *
 * Parameters:
 * @param req {Request} - The incoming HTTP request. Expects an Authorization header with a Bearer token.
 * @param _res {Response} - The HTTP response (unused in this middleware).
 * @param next {NextFunction} - Callback to pass control to the next middleware or error handler.
 *
 * Returns:
 * @returns {void} - Calls `next()` on success or forwards an error to the error handler.
 */
export function authenticationMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // Create or retrieve a request identifier for traceability
  const rid: string =
    (req.headers["x-request-id"] as string) ||
    Math.random().toString(36).slice(2);

  try {
    logger.debug("[Auth] Starting authentication", { rid });

    // Read Authorization header (case-insensitive, trims extra spaces)
    const rawHeader = (
      req.get("authorization") ??
      req.headers.authorization ??
      ""
    ).trim();
    if (!rawHeader) {
      logger.warn("[Auth] Missing Authorization header", { rid });
      throw getError(ErrorEnum.MISSING_AUTH_HEADER);
    }

    // Expect format: "Bearer <token>"
    const [scheme, token] = rawHeader.split(/\s+/);
    if (!/^Bearer$/i.test(scheme) || !token) {
      logger.warn("[Auth] Malformed Authorization header", {
        rid,
        value: rawHeader,
      });
      throw getError(ErrorEnum.BEARER_TOKEN_MALFORMED);
    }

    // Verify token using the configured JWT strategy (exceptions are thrown on failure)
    logger.debug("[Auth] Verifying JWT token", { rid });
    const payload = jwt.verify(token) as UserPayloadTypeSafe;

    // Attach payload to request for downstream usage
    (req as any).user = payload;

    logger.info("[Auth] Authentication successful", {
      rid,
      userId: payload?.id,
      role: (payload as any)?.role,
    });

    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("[Auth] Authentication failed", {
      rid,
      message,
      stack: err instanceof Error ? err.stack : undefined,
    });

    const mapped = getError(ErrorEnum.UNAUTHORIZED_ERROR);
    next(mapped);
  }
}
