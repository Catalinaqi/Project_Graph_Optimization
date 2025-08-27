/**
 * GraphSimulationResultModel Model
 *
 * Objective:
 * - Persist per-step outcomes of a simulation.
 * - Allow ranking by best path cost and detailed post-analysis.
 *
 * Fields:
 * - id_simulation_result (INTEGER): Primary key.
 * - id_simulation (INTEGER): FK → graph_simulation.id_simulation.
 * - tested_weight_simulation_result (string): Weight value tested (DECIMAL in DB, string in TS).
 * - path_simulation_result (JSONB): Path found (nodes sequence, etc.).
 * - path_cost_simulation_result (string): Optimal cost for the tested weight.
 * - execution_time_ms_simulation_result (string): Execution time in ms (DECIMAL in DB, string in TS).
 * - created_at_simulation_result (Date): Timestamp of creation.
 */

import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import logger from "@/config/logger";

export class GraphSimulationResultModel extends Model<
    InferAttributes<GraphSimulationResultModel>,
    InferCreationAttributes<GraphSimulationResultModel>
> {
    declare id_simulation_result: number;
    declare id_simulation: number;
    declare tested_weight_simulation_result: string;
    declare path_simulation_result: Record<string, unknown>;
    declare path_cost_simulation_result: string;
    declare execution_time_ms_simulation_result: string;
    declare created_at_simulation_result: Date;

    static initModel(sequelize: Sequelize): typeof GraphSimulationResultModel {
        logger.debug("[GraphSimulationResultModel] Initializing model...");

        GraphSimulationResultModel.init(
            {
                id_simulation_result: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
                id_simulation: { type: DataTypes.INTEGER, allowNull: false },
                tested_weight_simulation_result: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                path_simulation_result: { type: DataTypes.JSONB, allowNull: false },
                path_cost_simulation_result: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                execution_time_ms_simulation_result: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                created_at_simulation_result: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: "graph_simulation_result",
                modelName: "GraphSimulationResultModel",
                timestamps: false,
                indexes: [
                    { fields: ["id_simulation"], name: "idx_gsr_simulation" },
                    { fields: ["path_cost_simulation_result"], name: "idx_gsr_best_cost" },
                ],
            }
        );
        return GraphSimulationResultModel;
    }

    static associate(models: any) {
        logger.debug("[GraphSimulationResultModel] Registering associations...");

        GraphSimulationResultModel.belongsTo(models.GraphSimulation, { foreignKey: "id_simulation", as: "simulation", onDelete: "CASCADE" });
    }
}
