import type { GraphUserModel } from "@/model/graph-user.model";
import type { SetNewBalanceResult, Tx } from "@/common/types";
import { GraphRoleUserEnum } from "@/common/enums";

export interface UserIdao {
  /**
   * Find a user by their email.
   *  **/
  findByEmail(email: string, opt?: Tx): Promise<GraphUserModel | null>;

  /**
   * Find a user by their ID.
   *  **/
  findById(id: number, opt?: Tx): Promise<GraphUserModel | null>;

  /**
   * Create a new user.
   *  **/
  createUser(data: {
    email_user: string;
    password_user: string;
    role_user?: GraphRoleUserEnum;
    tokens_user?: string;
  }): Promise<GraphUserModel>;

  /**
   * Set a new balance for a user.
   *  **/
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

  /**
   * Set an absolute balance for a user.
   *  **/
  setAbsoluteBalance(
    userId: number,
    newAbsoluteBalance: number,
    performerId: number | null,
    reason: string,
    opt?: Tx,
  ): Promise<SetNewBalanceResult>;
}
