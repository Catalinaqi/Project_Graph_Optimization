import logger from "@/config/logger";
import environment from "@/config/enviroment";
import UserRepository from "@/repository/user.repository";
import { SecurityFactory } from "@/common/security/security-factory";

const hasher = SecurityFactory.makePasswordHasher();
const jwt = SecurityFactory.makeJwtStrategy();

/**
 * AuthService (Facade)
 *
 * Description:
 * Central entry point for user authentication and registration logic.
 * Orchestrates persistence (UserRepository), password hashing (bcrypt strategy),
 * and JWT issuance (RS256 strategy).
 *
 * Objective:
 * - Register new standard users with a securely hashed password.
 * - Authenticate existing users and return a signed JWT.
 */
const AuthService = {
    /**
     * register
     *
     * Description:
     * Registers a new standard user if the email is not already taken.
     *
     * Objective:
     * - Ensure uniqueness by email.
     * - Hash the provided password using the configured password hasher.
     * - Create the user with an initial token balance from configuration.
     *
     * Parameters:
     * @param email {string} - New user's email address.
     * @param password {string} - New user's plaintext password (will be hashed).
     *
     * Returns:
     * @returns {Promise<{ id: string; email: string }>} - Newly created user’s id and email.
     */
    async register(email: string, password: string): Promise<{ id: number; email: string }> {
        logger.info("[AuthService] Register started", { email });

        try {
            // 1) Check for existing user
            const exists = await UserRepository.getByEmail(email);
            if (exists) {
                logger.warn("[AuthService] Email already registered", { email });
                const err: any = new Error("Email already registered");
                err.status = 409;
                throw err;
            }

            // 2) Hash password
            logger.debug("[AuthService] Hashing password");
            const hash = await hasher.hash(password);

            // 3) Create user with initial tokens
            const initialTokens = Number(environment.initUserTokens ?? 0);
            logger.debug("[AuthService] Creating user in repository", {
                email,
                initialTokens,
            });

            const user = await UserRepository.create(email, hash, initialTokens);

            logger.info("[AuthService] Register completed", { userId: user.id_user, email });
            return { id: user.id_user, email: user.email_user };
        } catch (error: any) {
            logger.error("[AuthService] Register failed", {
                email,
                error: error?.message,
                stack: error?.stack,
            });
            throw error;
        }
    },

    /**
     * login
     *
     * Description:
     * Authenticates a user by verifying credentials and issues a signed JWT.
     *
     * Objective:
     * - Validate the user exists.
     * - Verify the provided password against the stored hash.
     * - Sign and return a JWT containing minimal user claims (id, email, role).
     *
     * Parameters:
     * @param email {string} - User’s email address.
     * @param password {string} - User’s plaintext password.
     *
     * Returns:
     * @returns {Promise<{ token: string; expiresIn: number }>} - Signed JWT and expiration (in seconds).
     */
    async login(email: string, password: string): Promise<{ token: string; expiresIn: number }> {
        logger.info("[AuthService] Login started", { email });

        try {
            // 1) Fetch user
            const user = await UserRepository.getByEmail(email);
            if (!user) {
                logger.warn("[AuthService] User not found during login", { email });
                const err: any = new Error("Invalid credentials");
                err.status = 401;
                throw err;
            }

            // 2) Verify password
            logger.debug("[AuthService] Verifying password");
            const ok = await hasher.compare(password, user.password_user);
            if (!ok) {
                logger.warn("[AuthService] Password verification failed", { email });
                const err: any = new Error("Invalid credentials");
                err.status = 401;
                throw err;
            }

            // 3) Sign JWT
            const payload = { id: user.id_user, email: user.email_user, role: user.role_user };
            logger.debug("[AuthService] Signing JWT", { userId: user.id_user, role: user.role_user });
            const token = jwt.sign(payload);

            const expiresIn =
                Number(environment.jwtExpiresIn ?? Number(process.env.JWT_EXPIRES_IN ?? 3600));

            logger.info("[AuthService] Login completed", { email, userId: user.id_user });
            return { token, expiresIn };
        } catch (error: any) {
            logger.error("[AuthService] Login failed", {
                email,
                error: error?.message,
                stack: error?.stack,
            });
            throw error;
        }
    },
};

export default AuthService;
