import type { UserIrepository } from "@/repository/interfaces/user.irepository";
import UserDao from "@/dao/user.dao";
import logger from "@/config/logger";
import { ReasonTokenTransactionEnum } from "@/common/enums";
import { Transaction } from "sequelize";
import type { Tx } from "@/common/types";
import { GraphUserModel } from "@/model/graph-user.model";

/**
 * UserRepository (Repository Implementation)
 *
 * Description:
 * Implements the `UserIrepository` interface to handle user data persistence.
 * Works as an intermediate layer between services (`UserService`, `AuthService`) and the DAO.
 * Encapsulates logging and basic validation logic.
 *
 * Main Operations:
 *  - Retrieve user by email or id.
 *  - Create a new user with default role and token balance.
 *  - Update a user's token balance with auditing.
 */
const UserRepository: UserIrepository = {
  /**
   * getByEmail (Method)
   *
   * Description:
   * Retrieves a user by their email address.
   *
   * Parameters:
   * @param email {string} - User's email to search for.
   *
   * Returns:
   * - `GraphUserModel` if found, otherwise `null`.
   */
  getByEmail(email) {
    logger.debug("[UserRepository] getByEmail called with email=%s", email);
    return UserDao.findByEmail(email);
  },

  /**
   * getById (Method)
   *
   * Description:
   * Retrieves a user by their unique ID.
   *
   * Parameters:
   * @param id {string} - User's unique identifier.
   *
   * Returns:
   * - `GraphUserModel` if found, otherwise `null`.
   */
  getById(id, opt?: Tx) {
    logger.debug("[UserRepository] getById called with id=%s", id);
    return opt?.transaction
      ? (GraphUserModel as any).findByPk(id, { transaction: opt.transaction })
      : UserDao.findById(id);
  },

  /**
   * create (Method)
   *
   * Description:
   * Creates a new user with a default role `user`, a hashed password, and an initial token balance.
   *
   * Parameters:
   * @param email {string} - Email of the new user.
   * @param passwordHash {string} - Hashed password of the user.
   * @param initialTokens {number} - Initial token balance assigned to the user.
   *
   * Returns:
   * - Newly created `GraphUserModel`.
   */
  async create(email, passwordHash, initialTokens) {
    logger.debug("[UserRepository] create called with email=%s", email);

    const created = await UserDao.createUser({
      email_user: email,
      password_user: passwordHash,
      tokens_user: initialTokens.toFixed(2),
    });

    await UserDao.setAbsoluteBalance(
      created.id_user,
      initialTokens,
      created.id_user, // performer = el propio user
      ReasonTokenTransactionEnum.SEED_RECHARGE,
    );

    return created;
  },

  /**
   * updateBalanceByEmail (Method)
   *
   * Description:
   * Updates the token balance of a user identified by email.
   * Performs validation, saves the updated balance, and records the audit log.
   *
   * Parameters:
   * @param email {string} - Target user's email.
   * @param rechargeTokens {number} - New token balance to assign.
   * @param performerId {string} - ID of the admin/user performing the operation.
   * @param reason {string | undefined} - Optional reason for the balance update (e.g., "admin recharge").
   *
   * Returns:
   * - Object with user's email and transaction details (previousTokens, newTokens, diff).
   *
   * Throws:
   * - Error with status 404 if the user is not found.
   */
  async updateTokensByEmail(email, rechargeTokens, performerId, reason) {
    logger.debug(
      "[UserRepository] Start execute ... UserDao.findByEmail with email=%s, newBarechargeTokenslance=%s",
      email,
      rechargeTokens,
    );

    const user = await UserDao.findByEmail(email);
    logger.info(
      "[UserRepository] Finished process ... UserDao.findByEmail with user=%s",
      user,
    );

    if (!user) {
      logger.warn("[UserRepository] Target user not found: email=%s", email);
      const err: any = new Error("Target user not found");
      err.status = 404;
      throw err;
    }

    logger.info(
      "[UserRepository] Start execute ... UserDao.setNewBalance for user: %s, rechargeTokens=%s, performerId=%s, reason=%s",
    );
    const tx = await UserDao.setNewBalance(
      user.id_user,
      rechargeTokens,
      performerId,
      ReasonTokenTransactionEnum.ADMIN_RECHARGE,
    );
    logger.info(
      "[UserRepository] Finished execute ... UserDao.setNewBalance, updated successfully for user: %s",
      user.email_user,
    );

    return { email: user.email_user, ...tx };
  },

  // usado por ModelService (cobro/ajuste absoluto dentro de la misma tx)
  async chargeByUserId(args: {
    userId: number;
    newBalance: number;
    performerId: number;
    reason: string;
    transaction?: Transaction;
  }) {
    const opt: Tx | undefined = args.transaction
      ? { transaction: args.transaction }
      : undefined;
    await UserDao.setAbsoluteBalance(
      args.userId,
      args.newBalance,
      args.performerId,
      args.reason,
      opt,
    );
    return { newBalance: Number(args.newBalance) };
  },
};

export default UserRepository;
