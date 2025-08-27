import type { GraphUserModel } from "@/model/graph-user.model";
import type { SetNewBalanceResult, Tx } from "@/common/types";
import { GraphRoleUserEnum } from "@/common/enums";

export interface UserIdao {
    /**
     * Buscar usuario por email
     */
    findByEmail(email: string, opt?: Tx): Promise<GraphUserModel | null>;

    /**
     * Buscar usuario por id (acepta transacción opcional)
     */
    findById(id: number, opt?: Tx): Promise<GraphUserModel | null>;

    /**
     * Crear usuario
     */
    createUser(data: {
        email_user: string;
        password_user: string;
        role_user?: GraphRoleUserEnum; // no limitar al literal .USER
        tokens_user?: string;          // almacenas DECIMAL como string "100.00"
    }): Promise<GraphUserModel>;

    /**
     * Recarga (+delta) — reutiliza tx si viene; si no, crea una
     */
    setNewBalance(
        userId: number,
        rechargeTokens: number,
        performerId: number | null,
        reason: string,
        opt?: Tx
    ): Promise<{
        previousTokens: number;
        rechargeTokens: number;     // delta aplicado (+)
        totalRechargeTokens: number; // saldo final
        updatedAt: string;           // ISO
    }>;

    /**
     * Cargo / ajuste absoluto (fija saldo final) — para creación/ejecución del modelo
     */
    setAbsoluteBalance(
        userId: number,
        newAbsoluteBalance: number,
        performerId: number | null,
        reason: string,
        opt?: Tx
    ): Promise<SetNewBalanceResult>;
}
