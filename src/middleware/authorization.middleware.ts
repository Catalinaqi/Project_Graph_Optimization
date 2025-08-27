import type { Request, Response, NextFunction } from "express";
import { getError } from "@/common/util/api-error";
import { ErrorEnum, GraphRoleUserEnum } from "@/common/enums";
import logger from "@/config/logger";

/**
 * AuthorizationMiddleware
 *
 * Description:
 * Role-based authorization middleware for protected routes.
 *
 * Objective:
 * - Ensure that the authenticated user has at least one of the required roles
 *   before allowing access to the route handler.
 *
 * Usage:
 * router.post(
 *   "/admin/recharge",
 *   authenticationMiddleware,
 *   AuthorizationMiddleware.requireRole(GraphRoleUserEnum.ADMIN),
 *   handler
 * );
 */
export class AuthorizationMiddleware {
    /**
     * requireRole
     *
     * Description:
     * Factory method that returns an Express middleware enforcing that the
     * authenticated user possesses one of the specified roles.
     *
     * Parameters:
     * @param roles {GraphRoleUserEnum[]} - One or more allowed roles for the route.
     *
     * Returns:
     * @returns {(req: Request, res: Response, next: NextFunction) => void} - Middleware that validates the user role.
     */
    static requireRole(...roles: GraphRoleUserEnum[]) {
        return (req: Request, _res: Response, next: NextFunction): void => {
            // Generate or reuse a request identifier for traceability in logs
            const rid: string =
                (req.headers["x-request-id"] as string) || Math.random().toString(36).slice(2);

            try {
                logger.debug("[AuthZ] Authorization started ... ", { rid, requiredRoles: roles });

                // The authentication middleware must have attached the user to the request
                if (!req.user) {
                    logger.warn("[AuthZ] Missing authenticated user on request", { rid });
                    return next(getError(ErrorEnum.UNAUTHORIZED_ERROR));
                }

                // Resolve the user role from the authenticated payload
                const userRole = req.user.role as GraphRoleUserEnum;
                logger.debug("[AuthZ] User role resolved", { rid, userRole });

                // Verify that the user's role is included in the allowed roles
                const allowed = roles.includes(userRole);
                if (!allowed) {
                    const message = `Requires one of the following roles: ${roles.join(", ")}`;
                    logger.warn("[AuthZ] Access denied due to insufficient role", {
                        rid,
                        userRole,
                        requiredRoles: roles,
                        message,
                    });
                    return next(getError(ErrorEnum.FORBIDDEN_ERROR, message));
                }

                logger.info("[AuthZ] Authorization granted", { rid, userRole });
                return next();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                logger.error("[AuthZ] Authorization check failed", {
                    rid,
                    error: message,
                    stack: err instanceof Error ? err.stack : undefined,
                });
                return next(getError(ErrorEnum.FORBIDDEN_ERROR));
            }
        };
    }
}
