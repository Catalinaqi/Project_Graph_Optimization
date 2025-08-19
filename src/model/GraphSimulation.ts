/**
 * GraphSimulation Model
 *
 * Objective:
 * - Define a parametric simulation on a specific model version.
 * - Sweep an edge weight from start→end with a given step.
 * - Link to the user who launched the simulation and store metadata.
 *
 * Fields:
 * - id_simulation (INTEGER): Primary key.
 * - id_model (INTEGER): FK → graph_model.id_model.
 * - version_number_simulation (number): Version number the simulation targets.
 * - id_user (INTEGER): FK → graph_user.id_user (simulation owner).
 * - from_node_simulation (string): Edge source node label under test.
 * - to_node_simulation (string): Edge target node label under test.
 * - start_weight_simulation (string): Start value (DECIMAL in DB, string in TS).
 * - end_weight_simulation (string): End value (DECIMAL in DB, string in TS).
 * - step_weight_simulation (string): Increment step (DECIMAL in DB, string in TS).
 * - created_at_simulation (Date): Timestamp of creation.
 */

import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import logger from "@/config/logger";

export class GraphSimulation extends Model<
    InferAttributes<GraphSimulation>,
    InferCreationAttributes<GraphSimulation>
> {
    declare id_simulation: number;
    declare id_model: number;
    declare version_number_simulation: number;
    declare id_user: number;
    declare from_node_simulation: string;
    declare to_node_simulation: string;
    declare start_weight_simulation: string;
    declare end_weight_simulation: string;
    declare step_weight_simulation: string;
    declare created_at_simulation: Date;

    static initModel(sequelize: Sequelize): typeof GraphSimulation {
        logger.debug("[GraphSimulation] Initializing model...");

        GraphSimulation.init(
            {
                id_simulation: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
                id_model: { type: DataTypes.INTEGER, allowNull: false },
                version_number_simulation: { type: DataTypes.INTEGER, allowNull: false },
                id_user: { type: DataTypes.INTEGER, allowNull: false },
                from_node_simulation: { type: DataTypes.STRING(255), allowNull: false },
                to_node_simulation: { type: DataTypes.STRING(255), allowNull: false },
                start_weight_simulation: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                end_weight_simulation: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                step_weight_simulation: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                created_at_simulation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: "graph_simulation",
                modelName: "GraphSimulation",
                timestamps: false,
                indexes: [{ fields: ["id_model", "created_at_simulation"], name: "idx_gs_model_created_at" }],
            }
        );
        return GraphSimulation;
    }

    static associate(models: any) {
        logger.debug("[GraphSimulation] Registering associations...");

        GraphSimulation.belongsTo(models.GraphModel, { foreignKey: "id_model", as: "model", onDelete: "CASCADE" });
        GraphSimulation.belongsTo(models.GraphUser, { foreignKey: "id_user", as: "user", onDelete: "RESTRICT" });
        GraphSimulation.hasMany(models.GraphSimulationResult, { foreignKey: "id_simulation", as: "results", onDelete: "CASCADE" });
    }
}
