import type { IUserDao } from "./dao-interface/IUserDao";
import { GraphUser } from "@/model/GraphUser";
import { GraphTokenTransaction } from "@/model/GraphTokenTransaction";
import logger from "@/config/logger";
import { Sequelize } from "sequelize";
import Database from "@/database/database";
import type { SetNewBalanceResult } from "@/common/types";


const sequelize: Sequelize = Database.getInstance();


/**
 * UserDao (DAO Implementation)
 *
 * Description:
 * Concrete implementation of `IUserDao` that interacts directly with the database
 * using Sequelize models (`GraphUser`, `GraphTokenTransaction`).
 *
 * Objective:
 * - Perform low-level CRUD/persistence operations without business logic.
 * - Keep DB access concerns isolated from services and repositories.
 */
const UserDao: IUserDao = {
    /**
     * findByEmail
     *
     * Description:
     * Find a user by email address.
     *
     * Objective:
     * - Query `graph_user` filtering by `email_user`.
     *
     * Parameters:
     * @param email {string} - Target user's email.
     *
     * Returns:
     * @returns {Promise<GraphUser | null>} - The user if found, otherwise null.
     */
    async findByEmail(email: string): Promise<GraphUser | null> {
        logger.debug("[UserDao] Starting findByEmail", { email });
        try {
            const user = await GraphUser.findOne({ where: { email_user: email } });
            logger.info("[UserDao] Finished findByEmail", { email, found: Boolean(user) });
            return user;
        } catch (err: any) {
            logger.error("[UserDao] Error in findByEmail", {
                email,
                error: err?.message,
                stack: err?.stack,
            });
            throw err;
        }
    },

    /**
     * findById
     *
     * Description:
     * Retrieve a user by primary key.
     *
     * Objective:
     * - Query `graph_user` by `id_user`.
     *
     * Parameters:
     * @param id {string} - User ID (primary key). Note: model uses UUID strings.
     *
     * Returns:
     * @returns {Promise<GraphUser | null>} - The user if found, otherwise null.
     */
    async findById(id: number): Promise<GraphUser | null> {
        logger.debug("[UserDao] Starting findById", { id });
        try {
            const user = await GraphUser.findByPk(id);
            logger.info("[UserDao] Finished findById", { id, found: Boolean(user) });
            return user;
        } catch (err: any) {
            logger.error("[UserDao] Error in findById", {
                id,
                error: err?.message,
                stack: err?.stack,
            });
            throw err;
        }
    },

    /**
     * createUser
     *
     * Description:
     * Insert a new user into the `graph_user` table.
     *
     * Objective:
     * - Persist email, hashed password, role, and initial tokens.
     *
     * Parameters:
     * @param data {{
     *   email_user: string;
     *   password_user: string;
     *   role_user?: "user" | "admin";
     *   tokens_user?: string;
     * }} - New user fields aligned with the model.
     *
     * Returns:
     * @returns {Promise<GraphUser>} - The newly created user entity.
     */
    async createUser(data: {
        email_user: string;
        password_user: string;
        role_user?: "user" | "admin";
        tokens_user?: string;
    }): Promise<GraphUser> {
        logger.debug("[UserDao] Starting createUser", { email: data.email_user });
        try {
            const created = await GraphUser.create(data as any);
            logger.info("[UserDao] User created successfully", {
                id: created.id_user,
                email: created.email_user,
                role: created.role_user,
            });
            return created;
        } catch (err: any) {
            logger.error("[UserDao] Error in createUser", {
                email: data.email_user,
                error: err?.message,
                stack: err?.stack,
            });
            throw err;
        }
    },

    /**
     * setNewBalance
     *
     * Description:
     * Atomically update a user's token balance inside a transaction and record an audit entry.
     *
     * Objective:
     * - Validate the new balance input.
     * - Lock the target row for update.
     * - Update the balance and persist an audit record to `graph_token_transaction`.
     * - Return a summary with previous, new, and diff values.
     *
     * Parameters:
     * @param userId {string | number} - Target user ID. Note: the model uses UUID strings; prefer `string`.
     * @param newBalance {number} - New token balance to assign.
     * @param performerId {string | null} - ID of the admin/user performing the operation (nullable).
     * @param reason {string} - Reason for the operation (e.g., "admin recharge").
     *
     * Returns:
     * @returns {Promise<{ previousTokens: number; newTokens: number; diff: number }>}
     */

    async setNewBalance(
        userId: any, // kept as-is to match your current signature; prefer `string` UUID in your model
        rechargeTokens: number,
        performerId: number | '',
        reason: string
    ): Promise<SetNewBalanceResult> {
            logger.debug("[UserDao] Starting setNewBalance (recharge mode)", {
                userId,
                rechargeTokens,
                performerId,
                hasReason: Boolean(reason),
            });

        logger.debug("[UserDao] Starting setNewBalance", {
            userId,
            rechargeTokens,
            performerId,
            hasReason: Boolean(reason),
        });

        return sequelize.transaction(async (t): Promise<SetNewBalanceResult> => {
                // 1) Strong numeric validation
                const parsed = Number(rechargeTokens);
                if (!Number.isFinite(parsed) || parsed <= 0 ){
                    logger.error("[UserDao] Invalid rechargeTokens (must be positive finite number)", { rechargeTokens });
                    const err: any = new Error("rechargeTokens must be a positive number");
                    err.status = 400;
                    throw err;
                }
                const deltaStr  = parsed.toFixed(2);
                const deltaNum  = Number(deltaStr );
                logger.debug("[UserDao] Recharge validated", { deltaStr , deltaNum  });

                // 2) Load and LOCK the target row
                logger.debug("[UserDao] Loading user with row-level lock");
                const user = await GraphUser.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
                if (!user) {
                    logger.warn("[UserDao] User not found", { userId });
                    const err: any = new Error("User not found");
                    err.status = 404;
                    throw err;
                }
                const prevStr = String(user.tokens_user);
                const previousNumTokens  = Number(prevStr);
                logger.debug("[UserDao] Current balance loaded", { prevStr, previousNumTokens  });

                // 3) Calcular nuevo saldo (total tras recarga)
                const nextNum = Number((previousNumTokens + deltaNum).toFixed(2));
                const nextStr = nextNum.toFixed(2);

                // 4) UPDATE estático
                logger.debug("[UserDao] Executing UPDATE tokens_user", { userId, setTo: nextStr });
                const [affected, rows] = await GraphUser.update(
                    { tokens_user: nextStr, updated_at_user: new Date() },
                    { where: { id_user: userId }, transaction: t, returning: true }
                );
                logger.debug("[UserDao] UPDATE executed", { affected });
                if (affected !== 1 || !rows?.[0]) {
                    logger.error("[UserDao] Balance update failed (unexpected affected rows)", { userId, affected });
                    const err: any = new Error("Balance update failed");
                    err.status = 409;
                    throw err;
                }

            // 5) Auditoría (guardamos el delta, pero no lo exponemos)
            await GraphTokenTransaction.create(
                {
                    id_user: userId,
                    id_performer_user: performerId ?? null,
                    prev_tokens_token_transaction: previousNumTokens.toFixed(2),
                    new_tokens_token_transaction: nextStr,
                    diff_tokens_token_transaction: deltaStr,
                    reason_token_transaction: reason,
                } as any,
                { transaction: t }
            );

            // 6) Payload con nombres CONSISTENTES con la firma
            const payload: SetNewBalanceResult = {
                previousTokens: previousNumTokens,
                rechargeTokens: deltaNum,
                totalRechargeTokens: nextNum,
                updatedAt: new Date().toLocaleString(),
            };
            return payload;
        });
    },
};

export default UserDao;
