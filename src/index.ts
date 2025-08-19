import { Router } from "express";
import authRouter from "@/router/auth.router";
import userRouter from "@/router/user.router";
import logger from "@/config/logger";

/**
 * Main API Router
 *
 * Description:
 * Initializes an Express Router that serves as the entry point for all REST routes.
 * This router mounts sub-routers for authentication and user management.
 *
 * Sub-routers:
 * - /auth  → handles authentication and login/logout
 * - /users → handles user management (CRUD operations, token recharge, etc.)
 */
const api = Router();

/**
 * Authentication Routes
 *
 * Description:
 * Routes under the /auth prefix are related to user authentication and login/logout.
 *
 * Parameters:
 * @param req.method {string} - HTTP method of the incoming request.
 * @param req.originalUrl {string} - Original URL of the request.
 */
api.use("/auth", (req, _res, next) => {
    logger.info('[API Router] Incoming request to /auth', {
        method: req.method,
        url: req.originalUrl,
    });
    next();
}, authRouter);

/**
 * User Routes
 *
 * Description:
 * Routes under the /users prefix are related to user management operations.
 *
 * Parameters:
 * @param req.method {string} - HTTP method of the incoming request.
 * @param req.originalUrl {string} - Original URL of the request.
 */
api.use("/users", (req, _res, next) => {
    logger.info('[API Router] Incoming request to /users', {
        method: req.method,
        url: req.originalUrl,
    });
    next();
}, userRouter);

export default api;
