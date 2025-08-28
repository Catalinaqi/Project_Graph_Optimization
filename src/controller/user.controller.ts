import type { Request, Response, NextFunction } from "express";
import UserService from "@/service/user.service";
import logger from "@/config/logger";
import { StatusCodes } from "http-status-codes";

/**
 * UserController (Controller)
 *
 * Description:
 * Handles HTTP requests related to user operations.
 * Requires the user to be authenticated via JWT middleware before access.
 *
 * Objective:
 * - Provide endpoints for retrieving the authenticated user's profile.
 * - Allow admins to recharge user tokens with proper auditing.
 */
export const UserController = {
  /**
   * me (Method)
   *
   * Endpoint: GET /users/me
   *
   * Description:
   * Returns the profile of the currently authenticated user.
   *
   * Parameters:
   * @param req {Request} - Express request object containing the authenticated user (req.user).
   * @param res {Response} - Express response object used to return profile data.
   * @param next {NextFunction} - Express next function for error handling.
   *
   * Response:
   * - 200 OK: JSON object with user profile (id, email, role, tokens).
   * - 404 Not Found: if the user does not exist.
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug("[UserController] GET /users/me called");
      const out = await UserService.me(req.user!.id);
      logger.info("[UserController] User profile retrieved successfully");
      res.status(200).json(out);
    } catch (err) {
      logger.error("[UserController] Error retrieving user profile", { err });
      next(err);
    }
  },

  /**
   * recharge (Method)
   *
   * Endpoint: POST /users/recharge
   *
   * Description:
   * Allows an admin to recharge tokens for a specified user.
   * Requires admin authentication and logs the action for auditing.
   *
   * Parameters:
   * @param req {Request} - Express request object containing:
   *  - req.body.email: Email of the user to recharge tokens for.
   *  - req.body.rechargeTokens: Number of tokens to add.
   *  - req.body.reason: Reason for the recharge (for auditing).
   *  - req.user: Authenticated admin user (from JWT).
   *  @param res {Response} - Express response object used to return success message and updated user data.
   *  @param next {NextFunction} - Express next function for error handling.
   *  Response:
   *  - 201 Created: JSON object with success message and updated user data.
   *  - 400 Bad Request: if input validation fails.
   *  - 403 Forbidden: if the requester is not an admin.
   *  - 404 Not Found: if the target user does not exist.
   *  - 500 Internal Server Error: for unexpected errors.
   *  Audit:
   *  Logs the admin ID, target user email, number of tokens recharged, and reason.
   */
  async recharge(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, rechargeTokens, reason } = req.body;

      logger.info(
        "[UserController] Start process the Admin %s is recharging tokens for:  %s",
        req.user!.id, // ID of the authenticated admin (extracted from JWT)
        email,
      );

      const out = await UserService.adminRecharge(
        email,
        Number(rechargeTokens),
        req.user!.id,
        reason,
      );

      logger.info(
        "[UserController] Finished process the Admin Tokens recharged with successfully for %s",
        email,
      );

      return res.status(StatusCodes.CREATED).json({
        message: "UTokens updated successfully",
        user: out,
      });
    } catch (err) {
      logger.error("[UserController] Error during token recharge", { err });
      next(err);
    }
  },
};
