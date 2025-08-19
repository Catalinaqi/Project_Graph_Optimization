import type { GraphUser } from "@/model/GraphUser";

/**
 * IUserDao (Interface)
 *
 * Description:
 * Defines the contract for direct access to user data in the database.
 * Represents the lowest level of persistence abstraction: each method maps
 * to a CRUD or data-related operation.
 *
 * Implemented by:
 * - `UserDao`, which interacts with Sequelize models.
 *
 * Main Methods:
 *  - `findByEmail` → find a user by email
 *  - `findById` → find a user by primary key (id)
 *  - `createUser` → create a new user with basic fields
 *  - `setNewBalance` → update token balance and return transaction details
 */
export interface IUserDao {
    /**
     * findByEmail (Method)
     *
     * Description:
     * Retrieves a user from the database based on their email.
     *
     * Parameters:
     * @param email {string} - User's email address to search for.
     *
     * Returns:
     * - `GraphUser` if found, otherwise `null`.
     */
    findByEmail(email: string): Promise<GraphUser | null>;

    /**
     * findById (Method)
     *
     * Description:
     * Retrieves a user from the database based on their unique identifier (primary key).
     *
     * Parameters:
     * @param id {string} - Unique identifier of the user.
     *
     * Returns:
     * - `GraphUser` if found, otherwise `null`.
     */
    findById(id: number): Promise<GraphUser | null>;

    /**
     * createUser (Method)
     *
     * Description:
     * Creates a new user in the database with the provided fields.
     *
     * Parameters:
     * @param data {object} - User creation data:
     *   - `email_user` {string}: User email.
     *   - `password_user` {string}: Hashed password.
     *   - `role_user?` {"user" | "admin"}: User role (default: user).
     *   - `tokens_user?` {string}: Initial token balance (optional).
     *
     * Returns:
     * - Newly created `GraphUser`.
     */
    createUser(data: {
        email_user: string;
        password_user: string;
        role_user?: "user" | "admin";
        tokens_user?: string;
    }): Promise<GraphUser>;

    /**
     * setNewBalance (Method)
     *
     * Description:
     * Updates the token balance of a given user and records the transaction details.
     *
     * Parameters:
     * @param userId {number} - Target user ID.
     * @param newBalance {number} - New token balance to assign.
     * @param performerId {string | null} - ID of the admin/user performing the operation (nullable).
     * @param reason {string} - Reason for the operation (e.g., "admin recharge").
     *
     * Returns:
     * - Object containing:
     *   - `previousTokens` {number}: Old token balance.
     *   - `newTokens` {number}: Updated token balance.
     *   - `diff` {number}: Difference between old and new balance.
     */
    setNewBalance(
        userId: number,
        newBalance: number,
        performerId: number | '',
        reason: string
    ): Promise<{ previousTokens: number; rechargeTokens: number; totalRechargeTokens: number; updatedAt: string }>;
}
