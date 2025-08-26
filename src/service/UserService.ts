import logger from "@/config/logger";
import UserRepository from "@/repository/UserRepository";

/**
 * UserService (Facade)
 *
 * Description:
 * Provides business operations related to users. Acts as a façade between
 * controllers and repositories by encapsulating application logic.
 *
 * Objective:
 * - Retrieve the authenticated user's profile.
 * - Allow an admin to recharge a user's token balance.
 */
const UserService = {
    /**
     * me
     *
     * Description:
     * Retrieves a user's profile by user id.
     *
     * Objective:
     * - Fetch user data from the repository.
     * - Return a normalized shape for the API layer.
     *
     * Parameters:
     * @param userId {string} - Unique identifier of the user.
     *
     * Returns:
     * @returns {Promise<{ id: string; email: string; role: string; tokens: number }>}
     */
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
                tokens: Number(u.tokens_user ),
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

    /**
     * adminRecharge
     *
     * Description:
     * Allows an administrator to set a user's token balance.
     *
     * Objective:
     * - Update the target user's token balance.
     * - Record who performed the operation and an optional reason for auditing.
     *
     * Parameters:
     * @param targetEmail {string} - Email of the user whose balance will be updated.
     * @param rechargeTokens {number} - Recharge token to set for the user.
     * @param performerId {string} - Identifier of the admin performing the operation.
     * @param reason {string} - Optional reason for the balance update.
     *
     * Returns:
     * @returns {Promise<any>} - Updated user data plus an ISO timestamp under `updatedAt`.
     */
    async adminRecharge(
        targetEmail: string,
        rechargeTokens: number,
        performerId: number,
        reason?: string
    ) {

        try {

            logger.info("[UserService] Start process ... UserRepository.updateBalanceByEmail",)
            const out = await UserRepository.updateTokensByEmail(
                targetEmail,
                rechargeTokens,
                performerId,
                reason
            );

            const result = { ...out, updatedAt: new Date().toISOString() };

            logger.info("[UserService] Finished process ... UserRepository.updateBalanceByEmail", {
                targetEmail,
                performerId,
                rechargeTokens,
            });

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
