import { Router } from "express";
import { UserController } from "@/controller/user.controller";
import { authenticationMiddleware } from "@/middleware/authentication.middleware";
import { AuthorizationMiddleware } from "@/middleware/authorization.middleware";
import logger from "@/config/logger";
import { GraphRoleUserEnum } from "@/common/enums";

/**
 * User Router
 *
 * Description:
 * Defines the routes related to user operations such as retrieving profile information
 * and recharging user tokens. All routes are protected with JWT authentication.
 * Sensitive operations are additionally protected with role-based authorization.
 */
const router = Router();

/**
 * GET /users/me
 *
 * Description:
 * Returns the information of the authenticated user.
 *
 * Objective:
 * - Validate the JWT token using the authentication middleware.
 * - Retrieve the user profile information from the controller.
 *
 * Parameters:
 * @param req.user {object} - Populated by the authentication middleware with user payload.
 *
 * Returns:
 * JSON containing the authenticated user’s information.
 */
router.get("/me", authenticationMiddleware, (req, res, next) => {
  logger.info("[User Router] Handling request: GET /users/me");
  UserController.me(req, res, next);
  logger.info("[User Router] Finished handling request: GET /users/me");
});

/**
 * POST /users/recharge
 *
 * Description:
 * Allows an administrator to recharge tokens for a user.
 *
 * Objective:
 * - Ensure the request is authenticated with JWT.
 * - Check that the authenticated user has the required role (e.g., ADMIN).
 * - Execute the token recharge logic in the controller.
 *
 * Parameters:
 * @param req.user {object} - Populated by the authentication middleware with user payload.
 * @param req.body.email {string} - Email of the user whose tokens should be recharged.
 * @param req.body.amount {number} - Amount of tokens to add.
 *
 * Returns:
 * JSON containing the result of the recharge operation.
 */
router.post(
  "/recharge",
  authenticationMiddleware,
  AuthorizationMiddleware.requireRole(GraphRoleUserEnum.ADMIN),
  (req, res, next) => {
    logger.info("[UserRouter] Start handling request: POST /users/recharge");
    UserController.recharge(req, res, next);
    logger.info("[UserRouter] Finished handling request: POST /users/recharge");
  },
);

export default router;
