import type { UserIrepository } from "@/repository/interfaces/user.irepository";
import UserDao from "@/dao/user.dao";
import logger from "@/config/logger";
import { ReasonTokenTransactionEnum } from "@/common/enums";
import { Transaction } from "sequelize";
import type { Tx } from "@/common/types";
import { GraphUserModel } from "@/model/graph-user.model";

const UserRepository: UserIrepository = {
  getByEmail(email) {
    logger.debug("[UserRepository] getByEmail called with email=%s", email);
    return UserDao.findByEmail(email);
  },

  getById(id, opt?: Tx) {
    logger.debug("[UserRepository] getById called with id=%s", id);
    return opt?.transaction
      ? (GraphUserModel as any).findByPk(id, { transaction: opt.transaction })
      : UserDao.findById(id);
  },

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
