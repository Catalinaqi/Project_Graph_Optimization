import type { UserIdao } from "@/dao/interfaces/user.idao";
import type { Tx } from "@/common/types";
import type { SetNewBalanceResult } from "@/common/types";
import { GraphUserModel } from "@/model/graph-user.model";
import { GraphTokenTransactionModel } from "@/model/graph-token-transaction.model";
import { Sequelize, Transaction } from "sequelize";
import Database from "@/database/database";
import logger from "@/config/logger";
import { GraphRoleUserEnum, ReasonTokenTransactionEnum } from "@/common/enums";

const sequelize: Sequelize = Database.getInstance();

/**
 * Aplica un nuevo saldo con lock pesimista y registra el movimiento en el ledger.
 * Defensa fuerte contra NaN/valores inválidos.
 */
async function applyBalanceWithLock(
    t: Transaction,
    args: { userId: number; performerId: number | null; reason: string; nextBalance: number }
): Promise<SetNewBalanceResult> {
    // 1) Cargar con lock
    const user = await GraphUserModel.findByPk(args.userId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!user) { const e: any = new Error("User not found"); e.status = 404; throw e; }

    // 2) Validar y normalizar
    const prevNum = Number(user.tokens_user ?? 0);
    const nextNum = Number(args.nextBalance);
    if (!Number.isFinite(nextNum) || nextNum < 0) {
        const e: any = new Error("nextBalance must be a finite number >= 0");
        e.status = 400;
        throw e;
    }
    const nextFixed = Number(nextNum.toFixed(2));
    const deltaNum = Number((nextFixed - prevNum).toFixed(2));

    // 3) Update del saldo
    const [affected] = await GraphUserModel.update(
        { tokens_user: nextFixed.toFixed(2), updated_at_user: new Date() },
        { where: { id_user: args.userId }, transaction: t, returning: false }
    );
    if (affected !== 1) { const e: any = new Error("Balance update failed"); e.status = 409; throw e; }

    // 4) Registrar en ledger
    await GraphTokenTransactionModel.create(
        {
            id_user: args.userId,
            id_performer_user: (args.performerId as number) || null,
            prev_tokens_token_transaction: prevNum.toFixed(2),
            diff_tokens_token_transaction: deltaNum.toFixed(2),
            new_tokens_token_transaction: nextFixed.toFixed(2),
            reason_token_transaction: args.reason ?? null,
        } as any,
        { transaction: t }
    );

    // 5) Payload consistente
    return {
        previousTokens: prevNum,
        rechargeTokens: deltaNum,
        totalRechargeTokens: nextFixed,
        updatedAt: new Date().toLocaleString(),
    };
}

const UserDao: UserIdao = {
    async findByEmail(email: string, opt?: Tx): Promise<GraphUserModel | null> {
        logger.debug("[UserDao] findByEmail email=%s", email);
        try {
            return await GraphUserModel.findOne({ where: { email_user: email }, ...(opt || {}) });
        } catch (err: any) {
            logger.error("[UserDao] Error in findByEmail email=%s err=%s", email, err?.message);
            throw err;
        }
    },

    async findById(id: number, opt?: Tx): Promise<GraphUserModel | null> {
        logger.debug("[UserDao] findById id=%s", id);
        if (!Number.isFinite(id) || id <= 0) {
            const e: any = new Error("Invalid user id");
            e.status = 400;
            throw e;
        }
        try {
            return await GraphUserModel.findByPk(id, { ...(opt || {}) });
        } catch (err: any) {
            logger.error("[UserDao] Error in findById id=%s err=%s", id, err?.message);
            throw err;
        }
    },

    async createUser(data: {
        email_user: string;
        password_user: string;
        role_user?: GraphRoleUserEnum;
        tokens_user?: string;
    }): Promise<GraphUserModel> {
        logger.debug("[UserDao] createUser email=%s", data.email_user);
        try {
            // Normalizar tokens a 2 decimales si viniera numérico
            if (data.tokens_user != null) {
                const n = Number(data.tokens_user);
                if (!Number.isFinite(n) || n < 0) {
                    const e: any = new Error("tokens_user must be a finite number >= 0");
                    e.status = 400;
                    throw e;
                }
                data.tokens_user = n.toFixed(2);
            }
            return await GraphUserModel.create(data as any);
        } catch (err: any) {
            logger.error("[UserDao] Error in createUser email=%s err=%s", data.email_user, err?.message);
            throw err;
        }
    },

    /** RECARGA (+delta). Reutiliza tx si viene; si no, crea una. */
    async setNewBalance(userId, rechargeTokens, performerId, reason, opt?: Tx) {
        const parsed = Number(rechargeTokens);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            const e: any = new Error("rechargeTokens must be a positive number");
            e.status = 400;
            throw e;
        }
        const delta = Number(parsed.toFixed(2));

        const run = async (t: Transaction) => {
            // leer prev con lock y construir next = prev + delta
            const u = await GraphUserModel.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!u) { const e: any = new Error("User not found"); e.status = 404; throw e; }
            const prev = Number(u.tokens_user ?? 0);
            const next = Number((prev + delta).toFixed(2));

            return applyBalanceWithLock(t, {
                userId,
                performerId,
                reason: reason || ReasonTokenTransactionEnum.ADMIN_RECHARGE,
                nextBalance: next,
            });
        };

        return opt?.transaction ? run(opt.transaction) : sequelize.transaction(run);
    },

    /** CARGO / AJUSTE ABSOLUTO (fija saldo final). Úsalo para crear/ejecutar modelo. */
    async setAbsoluteBalance(userId, newAbsoluteBalance, performerId, reason, opt?: Tx) {
        const next = Number(newAbsoluteBalance);
        if (!Number.isFinite(next) || next < 0) {
            const e: any = new Error("newAbsoluteBalance must be a number >= 0");
            e.status = 400;
            throw e;
        }
        const run = (t: Transaction) =>
            applyBalanceWithLock(t, {
                userId,
                performerId,
                reason,
                nextBalance: Number(next.toFixed(2)),
            });

        return opt?.transaction ? run(opt.transaction) : sequelize.transaction(run);
    },
};

export default UserDao;
