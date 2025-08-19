import type { QueryInterface } from "sequelize";
import bcrypt from "bcrypt";
import logger from "@/config/logger";
import enviroment  from '@/config/enviroment';

/**
 * Admin User Seed
 *
 * Description:
 * Sequelize seed that ensures an ADMIN user exists.
 *
 * Objective:
 * - Create an ADMIN user with a bcrypt-hashed password if it does not already exist.
 * - Avoid duplicates by checking for the email beforehand.
 *
 * Environment Variables:
 * - ADMIN_EMAIL: Admin email (default: admin@test.com)
 * - ADMIN_PASSWORD: Admin plain password for seeding only (default: admin123)
 * - ADMIN_TOKENS: Initial token balance for the admin (default: 999)
 * - SALT_ROUNDS: Bcrypt salt rounds (default: 12)
 */
const ADMIN_EMAIL = enviroment.adminEmail ?? "admin@test.com";
const ADMIN_PASS = enviroment.passwordAdmin ?? "admin123";
const ADMIN_TOKENS = Number(enviroment.adminTokens ?? 999);
const SALT_ROUNDS = Number(enviroment.saltRounds ?? 12);

export default {
    /**
     * up
     *
     * Description:
     * Applies the seed by creating the ADMIN user if it does not exist.
     *
     * Parameters:
     * @param queryInterface {QueryInterface} - Sequelize QueryInterface used to run raw SQL.
     *
     * Returns:
     * @returns {Promise<void>}
     */
    async up(queryInterface: QueryInterface): Promise<void> {
        logger.debug("[Seed:Admin] Starting 'up' execution", {
            email: ADMIN_EMAIL,
            tokens: ADMIN_TOKENS,
        });

        try {
            //const saltRounds = Number(process.env.SALT_ROUNDS ?? 12);
            logger.debug("[Seed:Admin] Hashing admin password with bcrypt", { SALT_ROUNDS });

            const hash = await bcrypt.hash(ADMIN_PASS, SALT_ROUNDS);

            logger.debug("[Seed:Admin] Checking if admin user already exists", { email: ADMIN_EMAIL });
            const [exists] = await queryInterface.sequelize.query(
                `SELECT 1 FROM graph_user WHERE email_user = :email LIMIT 1`,
                { replacements: { email: ADMIN_EMAIL } }
            );

            if ((exists as any[]).length > 0) {
                logger.info("[Seed:Admin] Admin user already exists, skipping creation", { email: ADMIN_EMAIL });
                return;
            }

            logger.info("[Seed:Admin] Creating admin user", { email: ADMIN_EMAIL, tokens: ADMIN_TOKENS });
            await queryInterface.sequelize.query(
                `INSERT INTO graph_user
           (id_user, email_user, password_user, role_user, tokens_user, created_at_user, updated_at_user)
         VALUES (gen_random_uuid(), :email, :pass, 'admin', :tokens, NOW(), NOW())`,
                { replacements: { email: ADMIN_EMAIL, pass: hash, tokens: ADMIN_TOKENS } }
            );

            logger.info("[Seed:Admin] Admin user created successfully", { email: ADMIN_EMAIL });
        } catch (error: any) {
            logger.error("[Seed:Admin] Failed to execute 'up'", {
                email: ADMIN_EMAIL,
                error: error?.message,
                stack: error?.stack,
            });
            throw error;
        }
    },

    /**
     * down
     *
     * Description:
     * Reverts the seed by deleting the ADMIN user with the configured email.
     *
     * Parameters:
     * @param queryInterface {QueryInterface} - Sequelize QueryInterface used to run raw SQL.
     *
     * Returns:
     * @returns {Promise<void>}
     */
    async down(queryInterface: QueryInterface): Promise<void> {
        logger.debug("[Seed:Admin] Starting 'down' execution", { email: ADMIN_EMAIL });

        try {
            const [result] = await queryInterface.sequelize.query(
                `DELETE FROM graph_user WHERE email_user = :email AND role_user = 'admin'`,
                { replacements: { email: ADMIN_EMAIL } }
            );

            // Best-effort info about affected rows (dialect-dependent)
            logger.info("[Seed:Admin] Admin user deletion requested", {
                email: ADMIN_EMAIL,
                resultSummary: result,
            });
        } catch (error: any) {
            logger.error("[Seed:Admin] Failed to execute 'down'", {
                email: ADMIN_EMAIL,
                error: error?.message,
                stack: error?.stack,
            });
            throw error;
        }
    },
};
