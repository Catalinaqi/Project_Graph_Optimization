/**
 * Models bootstrap
 *
 * Objective:
 * - Centralize model initialization and association wiring.
 * - Return a typed map of models to be used across the app.
 *
 * Usage:
 * - const models = initModels(sequelize);
 * - models.GraphUserModel, models.GraphModel, ...
 */

import { Sequelize } from "sequelize";
import { GraphUserModel } from "./graph-user.model";
import { GraphModel } from "./graph.model";
import { GraphVersionModel } from "./graph-version.model";
import { GraphWeightChangeRequestModel } from "./graph-weight-change-request.model";
import { GraphSimulationModel } from "./graph-simulation.model";
import { GraphSimulationResultModel } from "./graph-simulation-result.model";
import { GraphTokenTransactionModel } from "./graph-token-transaction.model";
import logger from "@/config/logger";

export function initModels(sequelize: Sequelize) {
  logger.debug("[Models] Bootstrapping...");

  // 1) Initialize
  GraphUserModel.initModel(sequelize);
  GraphModel.initModel(sequelize);
  GraphVersionModel.initModel(sequelize);
  GraphWeightChangeRequestModel.initModel(sequelize);
  GraphSimulationModel.initModel(sequelize);
  GraphSimulationResultModel.initModel(sequelize);
  GraphTokenTransactionModel.initModel(sequelize);

  const models = {
    GraphUser: GraphUserModel,
    GraphModel,
    GraphVersion: GraphVersionModel,
    GraphWeightChangeRequest: GraphWeightChangeRequestModel,
    GraphSimulation: GraphSimulationModel,
    GraphSimulationResult: GraphSimulationResultModel,
    GraphTokenTransaction: GraphTokenTransactionModel,
  };

  // 2) Associations
  GraphUserModel.associate(models);
  GraphModel.associate(models);
  GraphVersionModel.associate(models);
  GraphWeightChangeRequestModel.associate(models);
  GraphSimulationModel.associate(models);
  GraphSimulationResultModel.associate(models);
  GraphTokenTransactionModel.associate(models);

  logger.debug("[Models] Ready.");
  return models;
}
