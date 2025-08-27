import type { Request, Response, NextFunction } from "express";
import AuthService from "@/service/auth.service";
import logger from "@/config/logger";

/**
 * AuthController
 *
 * Description:
 * Controller responsible for handling HTTP requests related to user authentication.
 * Exposes methods for user registration and login.
 * Delegates the actual business logic to `AuthService` and ensures proper HTTP responses.
 */
export const AuthController = {
  /**
   * POST /auth/register
   *
   * Description:
   * Registers a new user with a standard role (user).
   *
   * Objective:
   * - Extract email and password from the request body.
   * - Call `AuthService.register` to create a new user.
   * - Return a 201 Created response with registration data.
   *
   * @param req Express Request object. Expects `email` and `password` in `req.body`.
   * @param res Express Response object used to send back JSON response.
   * @param next Express NextFunction used for error propagation.
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug("[AuthController] Register request received", {
        route: "/auth/register",
        body: { email: req.body?.email },
      });

      const { email, password } = req.body;
      const result = await AuthService.register(email, password);

      logger.info("[AuthController] User registered successfully", {
        email,
      });

      res.status(201).json({
        message: "User registered successfully",
        ...result,
      });
    } catch (err) {
      logger.error("[AuthController] Registration failed", {
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  },

  /**
   * POST /auth/login
   *
   * Description:
   * Authenticates a user and returns a signed JWT (RS256 algorithm).
   *
   * Objective:
   * - Extract email and password from the request body.
   * - Call `AuthService.login` to validate credentials and generate JWT.
   * - Return a 200 OK response with the token and user data.
   *
   * @param req Express Request object. Expects `email` and `password` in `req.body`.
   * @param res Express Response object used to send back JSON response.
   * @param next Express NextFunction used for error propagation.
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      logger.debug("[AuthController] Login request received", {
        route: "/auth/login",
        body: { email: req.body?.email },
      });

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      logger.info("[AuthController] User logged in successfully", {
        email,
      });

      res.status(200).json(result);
    } catch (err) {
      logger.error("[AuthController] Login failed", {
        error: err instanceof Error ? err.message : err,
      });
      next(err);
    }
  },
};
