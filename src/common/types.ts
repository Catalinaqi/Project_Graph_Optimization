import { GraphRoleUserEnum } from "@/common/enums";
import Joi from "joi";

import type { Transaction } from "sequelize";

export type Tx = { transaction?: Transaction };

//**User payload stored in JWT token - type safe */
interface UserPayloadTypeSafe {
  id: number;
  email: string;
  role: GraphRoleUserEnum;
  token?: number;
  iat?: number;
  exp?: number;
}

//**Result of setting a new balance for a user */
interface SetNewBalanceResult {
  previousTokens: number;
  rechargeTokens: number;
  totalRechargeTokens: number;
  updatedAt: string;
}

//**Input for creating a new model and for executing*/
interface CreateModelInput {
  ownerUserId: number;
  name: string;
  description: string | null;
  graph: Record<string, Record<string, number>>;
}

//**Input for executing a model*/
interface ExecuteInput {
  modelId: number;
  start: string;
  goal: string;
  userId: number;
}

//**Input for simulating a model*/
interface SimulationInput {
  id_model: number;
  version_number_simulation: number;
  id_user: number;
  from_node_simulation: string;
  to_node_simulation: string;
  start_weight_simulation: number;
  end_weight_simulation: number;
  step_weight_simulation: number;
  created_at_simulation: Date;
}

//**Input for storing a simulation result*/
interface SimulationResultInput {
  id_simulation: number;
  tested_weight_simulation_result: number;
  path_simulation_result: string;
  path_cost_simulation_result: number;
  execution_time_ms_simulation_result: number;
  created_at_simulation_result: Date;
}

//**Validation error structure */
interface ValidationError {
  field: string;
  message: string;
  value?: Joi.ValidationErrorItem;
  type: string;
}

//**Environment configuration */
interface Enviroment {
  nodeEnv: string;
  apiPort: number;
  appTz: string;

  // Database
  postgresPort: number;
  postgresHost: string;
  postgresUser: string;
  postgresPassword: string;
  postgresDB: string;

  // JWT
  jwtPrivateKeyPath: string;
  jwtPublicKeyPath: string;
  jwtExpiresIn: number;
  jwtAlgorithm: string;
  jwtIssuer?: string;
  jwtAudience?: string;

  // Security
  saltRounds: number;
  initUserTokens: number;

  // Admin
  adminEmail?: string;
  passwordAdmin?: string;
  adminTokens?: number;

  // Graph
  graphAlphaKey: number;
}

//** Exporting all types
export {
  Enviroment,
  UserPayloadTypeSafe,
  SetNewBalanceResult,
  ValidationError,
  CreateModelInput,
  ExecuteInput,
  SimulationInput,
  SimulationResultInput,
};
