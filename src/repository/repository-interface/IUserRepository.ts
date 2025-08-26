import type { GraphUser } from "@/model/GraphUser";
import type { Transaction } from "sequelize";
import type {Tx} from "@/common/types";


/**
 * IUserRepository (Interface)
 *
 * Description:
 * Defines the contract for a user repository. It ensures that any concrete
 * implementation (e.g., `UserRepository`) provides the required methods for
 * retrieving, creating, and updating users.
 *
 * Objective:
 * - Abstract away database-specific operations.
 * - Provide type-safe access to user-related persistence methods.
 * - Enforce a consistent API across different repository implementations.
 *
 * Main Methods:
 * - getByEmail → find a user by email.
 * - getById → find a user by id.
 * - create → create a new user with a hashed password and initial tokens.
 * - updateBalanceByEmail → update the token balance of a user and return update details.
 */
export interface IUserRepository {
    /**
     * getByEmail
     *
     * Description:
     * Retrieves a user by email from the database.
     *
     * Parameters:
     * @param email {string} - Email address of the user to search for.
     *
     * Returns:
     * @returns {Promise<GraphUser | null>} - The user if found, otherwise null.
     */
    getByEmail(email: string): Promise<GraphUser | null>;

    /**
     * getById
     *
     * Description:
     * Retrieves a user by unique identifier from the database.
     *
     * Parameters:
     * @param id {string} - Unique identifier of the user.
     *
     * Returns:
     * @returns {Promise<GraphUser | null>} - The user if found, otherwise null.
     */
    getById(id: number,opt?: Tx): Promise<GraphUser | null>;

    /**
     * create
     *
     * Description:
     * Creates a new user in the database with hashed password and initial token balance.
     *
     * Parameters:
     * @param email {string} - Email address of the new user.
     * @param passwordHash {string} - Hashed password of the user.
     * @param initialTokens {number} - Initial number of tokens assigned to the user.
     *
     * Returns:
     * @returns {Promise<GraphUser>} - The newly created user entity.
     */
    create(
        email: string,
        passwordHash: string,
        initialTokens: number
    ): Promise<GraphUser>;

    /**
     * updateBalanceByEmail
     *
     * Description:
     * Updates the token balance of a user identified by email.
     * Also records the id of the performer and an optional reason for auditing.
     *
     * Parameters:
     * @param email {string} - Email address of the target user.
     * @param rechargeTokens {number} - New token balance to set.
     * @param performerId {string} - Id of the admin/user performing the operation.
     * @param reason {string} - Optional reason for the recharge (e.g., "admin recharge").
     *
     * Returns:
     * @returns {Promise<{ email: string; previousTokens: number; newTokens: number; diff: number }>}
     * - An object with email, previous tokens, new tokens, and difference applied.
     */
    updateTokensByEmail(
        email: string,
        rechargeTokens: number,
        performerId: number,
        reason?: string
    ): Promise<{
        email: string;
        previousTokens: number;
        rechargeTokens: number;
        totalRechargeTokens: number;
        //diff: number;
    }>;

    // cobro absoluto por id (usado por create/execute)
    chargeByUserId(args: {
        userId: number;
        newBalance: number;
        performerId: number;
        reason: string;
        transaction?: Transaction;
    }): Promise<{ newBalance: number }>;

    //updateTokens(userId: number, newBalance: number, opt?: Tx): Promise<void>;

    //updateTokens(userId: number, newTokens: number, opt?: Tx): Promise<[affectedCount: number]>;

}
