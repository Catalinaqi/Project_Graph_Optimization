/**
 * Models bootstrap
 *
 * Objective:
 * - Centralize model initialization and association wiring.
 * - Return a typed map of models to be used across the app.
 *
 * Usage:
 * - const models = initModels(sequelize);
 * - models.GraphUser, models.GraphModel, ...
 */

import { Sequelize } from "sequelize";
import { GraphUser } from "./GraphUser";
import { GraphModel } from "./GraphModel";
import { GraphVersion } from "./GraphVersion";
import { GraphWeightChangeRequest } from "./GraphWeightChangeRequest";
import { GraphSimulation } from "./GraphSimulation";
import { GraphSimulationResult } from "./GraphSimulationResult";
import { GraphTokenTransaction } from "./GraphTokenTransaction";
import logger from "@/config/logger";

export function initModels(sequelize: Sequelize) {
    logger.debug("[Models] Bootstrapping...");

    // 1) Initialize
    GraphUser.initModel(sequelize);
    GraphModel.initModel(sequelize);
    GraphVersion.initModel(sequelize);
    GraphWeightChangeRequest.initModel(sequelize);
    GraphSimulation.initModel(sequelize);
    GraphSimulationResult.initModel(sequelize);
    GraphTokenTransaction.initModel(sequelize);

    const models = {
        GraphUser,
        GraphModel,
        GraphVersion,
        GraphWeightChangeRequest,
        GraphSimulation,
        GraphSimulationResult,
        GraphTokenTransaction,
    };

    // 2) Associations
    GraphUser.associate(models);
    GraphModel.associate(models);
    GraphVersion.associate(models);
    GraphWeightChangeRequest.associate(models);
    GraphSimulation.associate(models);
    GraphSimulationResult.associate(models);
    GraphTokenTransaction.associate(models);

    logger.debug("[Models] Ready.");
    return models;
}
