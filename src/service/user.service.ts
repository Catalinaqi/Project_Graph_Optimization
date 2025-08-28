import logger from "@/config/logger";
import UserRepository from "@/repository/user.repository";

const UserService = {
  async me(userId: number) {
    logger.debug("[UserService] Fetching user profile", { userId });
    try {
      const u = await UserRepository.getById(userId);

      if (!u) {
        logger.warn("[UserService] User not found", { userId });
        const err: any = new Error("User not found");
        err.status = 404;
        throw err;
      }

      const profile = {
        id: u.id_user,
        email: u.email_user,
        role: u.role_user,
        tokens: Number(u.tokens_user),
      };

      logger.info("[UserService] User profile retrieved", { userId });
      return profile;
    } catch (error: any) {
      logger.error("[UserService] Failed to fetch user profile", {
        userId,
        error: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  },

  async adminRecharge(
    targetEmail: string,
    rechargeTokens: number,
    performerId: number,
    reason?: string,
  ) {
    try {
      logger.info(
        "[UserService] Start process ... UserRepository.updateBalanceByEmail",
      );
      const out = await UserRepository.updateTokensByEmail(
        targetEmail,
        rechargeTokens,
        performerId,
        reason,
      );

      const result = { ...out, updatedAt: new Date().toLocaleString() };

      logger.info(
        "[UserService] Finished process ... UserRepository.updateBalanceByEmail",
        {
          targetEmail,
          performerId,
          rechargeTokens,
        },
      );

      return result;
    } catch (error: any) {
      logger.error("[UserService] Admin recharge failed", {
        targetEmail,
        performerId,
        rechargeTokens,
        error: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  },
};

export default UserService;
