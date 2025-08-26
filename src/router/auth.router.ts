import { Router } from 'express';
import { AuthController } from '@/controller/auth.controller';
import logger from '@/config/logger';

/**
 * Authentication Router
 *
 * Description:
 * This router manages user authentication endpoints.
 * It provides routes for user registration and login.
 * JWT authentication is not required here because these are entry points.
 */
const router = Router();

/**
 * POST /auth/register
 *
 * Description:
 * Registers a new user in the system.
 *
 * Objective:
 * Validate the provided data, create a new user in the database,
 * and return the user information or an initial access token.
 *
 * Parameters:
 * @param req.body.email {string} - The email of the user to register.
 * @param req.body.password {string} - The password of the user to register.
 * @param req.body.[otherFields] {any} - Additional optional registration fields.
 *
 * Returns:
 * JSON containing the registered user information and/or a JWT token.
 */


router.post('/register', (req, res, next) => {
    logger.info('[Auth Router] Handling request: POST /auth/register');
    AuthController.register(req, res, next);
    logger.info('[Auth Router] Finished handling request: POST /auth/register');
});

/*
logger.info('[Auth Router] Handling request: POST /auth/register');
router.post('/register', validationMiddleware(UserSchema.register), catchAsync(AuthController.register));
logger.info('[Auth Router] Finished handling request: POST /auth/register');
*/
/**
 * POST /auth/login
 *
 * Description:
 * Authenticates an existing user.
 *
 * Objective:
 * Validate the provided credentials and return a signed JWT token if valid.
 * If credentials are invalid, return an authentication error.
 *
 * Parameters:
 * @param req.body.email {string} - The email of the user.
 * @param req.body.password {string} - The password of the user.
 *
 * Returns:
 * JSON containing a JWT token if the login is successful.
 */
router.post('/login', (req, res, next) => {
    logger.info('[Auth Router] Handling request: POST /auth/login');
    AuthController.login(req, res, next);
    logger.info('[Auth Router] Finished handling request: POST /auth/login');
});

export default router;
