import type { Request, Response, NextFunction } from "express";
import UserService from "@/service/user.service";
import logger from "@/config/logger";
import {StatusCodes} from 'http-status-codes';

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
     * Recharges a user's token balance (admin-only action).
     * Also records an audit of the recharge operation.
     *
     * Parameters:
     * @param req {Request} - Express request object containing:
     *   - body.email {string} - Target user's email.
     *   - body.newBalance {number} - New token balance to set.
     *   - body.reason {string | undefined} - Optional reason for the recharge.
     *   - req.user!.id {string} - The admin user ID performing the operation.
     * @param res {Response} - Express response object used to return confirmation.
     * @param next {NextFunction} - Express next function for error handling.
     *
     * Response:
     * - 200 OK: JSON object with confirmation message and updated balance.
     * - 403 Forbidden: if the user is not authorized (non-admin).
     * - 404 Not Found: if the target user does not exist.
     */
    async recharge(req: Request, res: Response, next: NextFunction) {
        try {
            // 🟢 Step 1: Log that the recharge endpoint was called
            //logger.debug("[UserController] POST /users/recharge called ...");

            // 🟢 Step 2: Extract parameters from the request body
            //   - email → the target user’s email to recharge
            //   - newBalance → the new token balance to set
            //   - reason → justification for the recharge (auditing)
            const { email, rechargeTokens, reason } = req.body;

            // 🟢 Step 3: Log the action, showing which admin is performing the recharge

            logger.info(
                "[UserController] Start process the Admin %s is recharging tokens for:  %s",
                req.user!.id, // ID of the authenticated admin (extracted from JWT)
                email
            );

            // 🟢 Step 4: Call the service layer to perform the actual recharge
            //   - email: user to update
            //   - Number(rechargeTokens): new token amount (casted to number)
            //   - req.user!.id: ID of the admin performing the action
            //   - reason: explanation for the recharge
            const out = await UserService.adminRecharge(
                email,
                Number(rechargeTokens),
                req.user!.id,
                reason
            );

            // 🟢 Step 5: Log successful recharge
            logger.info(
                "[UserController] Finished process the Admin Tokens recharged with successfully for %s",
                email
            );

            // 🟢 Step 6: Send success response to the client with updated info
            //CHANGE ALL
            //res.status(200).json({ message: "Tokens updated successfully", ...out });
            return res.status(StatusCodes.CREATED).json({
                message: "UTokens updated successfully",
                user: out,
            });

        } catch (err) {
            // 🔴 Step 7: If any error occurs:
            //   - Log the error
            //   - Pass it to the error-handling middleware
            logger.error("[UserController] Error during token recharge", { err });
            next(err);
        }
    },
};
