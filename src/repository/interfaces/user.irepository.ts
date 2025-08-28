import type { GraphUserModel } from "@/model/graph-user.model";
import type { Transaction } from "sequelize";
import type { Tx } from "@/common/types";

export interface UserIrepository {
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
   * @returns {Promise<GraphUserModel | null>} - The user if found, otherwise null.
   */
  getByEmail(email: string): Promise<GraphUserModel | null>;

  /**
   * getById
   *
   * Description:
   * Retrieves a user by their unique ID from the database.
   *
   * Parameters:
   * @param id {number} - The unique identifier of the user.
   * @param opt {Tx} - Optional transaction object for database operations.
   *
   * Returns:
   * @returns {Promise<GraphUserModel | null>} - The user if found, otherwise null.
   */

  getById(id: number, opt?: Tx): Promise<GraphUserModel | null>;

  /**
   * create
   *
   * Description:
   * Creates a new user in the database with the provided email, password hash, and initial token balance.
   *
   * Parameters:
   * @param email {string} - The email address of the new user.
   * @param passwordHash {string} - The hashed password for the new user.
   * @param initialTokens {number} - The initial token balance for the new user.
   *
   * Returns:
   * @returns {Promise<GraphUserModel>} - The newly created user.
   */
  create(
    email: string,
    passwordHash: string,
    initialTokens: number,
  ): Promise<GraphUserModel>;

  /**
   * updateTokensByEmail
   *
   * Description:
   * Updates the token balance of a user identified by their email address.
   *
   * Parameters:
   * @param email {string} - The email address of the user whose tokens are to be updated.
   * @param rechargeTokens {number} - The amount of tokens to add (or subtract if negative) to the user's balance.
   * @param performerId {number} - The ID of the user performing the token update.
   * @param reason {string} - Optional reason for the token update.
   *
   * Returns:
   * @returns {Promise<{ email: string; previousTokens: number; rechargeTokens: number; totalRechargeTokens: number; }>} - An object containing details of the token update operation.
   *
   */
  updateTokensByEmail(
    email: string,
    rechargeTokens: number,
    performerId: number,
    reason?: string,
  ): Promise<{
    email: string;
    previousTokens: number;
    rechargeTokens: number;
    totalRechargeTokens: number;
    //diff: number;
  }>;

  /**
   * setAbsoluteBalance
   *
   * Description:
   * Sets the absolute token balance for a user identified by their user ID.
   *
   * Parameters:
   * @param args {object} - An object containing the following properties:
   *   - userId {number}: The ID of the user whose balance is to be set.
   *   - newBalance {number}: The new absolute token balance to set for the user.
   *   - performerId {number}: The ID of the user performing the balance update.
   *   - reason {string}: The reason for setting the new balance.
   *   - transaction {Transaction} [optional]: An optional Sequelize transaction object for atomic operations.
   *
   *   Returns:
   *   @returns {Promise<{ newBalance: number }>} - An object containing the updated balance.
   */
  chargeByUserId(args: {
    userId: number;
    newBalance: number;
    performerId: number;
    reason: string;
    transaction?: Transaction;
  }): Promise<{ newBalance: number }>;
}
