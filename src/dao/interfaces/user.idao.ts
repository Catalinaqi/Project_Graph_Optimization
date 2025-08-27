import type { GraphUserModel } from "@/model/graph-user.model";
import type { SetNewBalanceResult, Tx } from "@/common/types";
import { GraphRoleUserEnum } from "@/common/enums";

export interface UserIdao {
  findByEmail(email: string, opt?: Tx): Promise<GraphUserModel | null>;

  findById(id: number, opt?: Tx): Promise<GraphUserModel | null>;

  createUser(data: {
    email_user: string;
    password_user: string;
    role_user?: GraphRoleUserEnum;
    tokens_user?: string;
  }): Promise<GraphUserModel>;

  setNewBalance(
    userId: number,
    rechargeTokens: number,
    performerId: number | null,
    reason: string,
    opt?: Tx,
  ): Promise<{
    previousTokens: number;
    rechargeTokens: number;
    totalRechargeTokens: number;
    updatedAt: string;
  }>;

  setAbsoluteBalance(
    userId: number,
    newAbsoluteBalance: number,
    performerId: number | null,
    reason: string,
    opt?: Tx,
  ): Promise<SetNewBalanceResult>;
}
