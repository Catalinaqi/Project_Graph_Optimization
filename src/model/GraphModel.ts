/**
 * GraphModel Model
 *
 * Objective:
 * - Represent a graph optimization model owned by a user.
 * - Track metadata (name/description) and the current version number.
 * - Serve as the parent entity for versions, requests, and simulations.
 *
 * Fields:
 * - id_model (INTEGER): Primary key.
 * - id_owner_user (INTEGER): FK → graph_user.id_user (model owner).
 * - name_model (string): Human-readable model name (unique per owner).
 * - description_model (string|null): Optional description.
 * - current_version_model (number): Latest version number for quick access.
 * - created_at_model (Date): Timestamp of creation.
 * - updated_at_model (Date): Timestamp of last update.
 */

import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import logger from "@/config/logger";

export class GraphModel extends Model<
    InferAttributes<GraphModel>,
    InferCreationAttributes<GraphModel>
> {
    declare id_model: number;
    declare id_owner_user: number;
    declare name_model: string;
    declare description_model: string | null;
    declare current_version_model: number;
    declare created_at_model: Date;
    declare updated_at_model: Date;

    static initModel(sequelize: Sequelize): typeof GraphModel {
        logger.debug("[GraphModel] Initializing model...");

        GraphModel.init(
            {
                id_model: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
                id_owner_user: { type: DataTypes.INTEGER, allowNull: false },
                name_model: { type: DataTypes.STRING(255), allowNull: false },
                description_model: { type: DataTypes.TEXT, allowNull: true },
                current_version_model: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
                created_at_model: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                updated_at_model: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: "graph_model",
                modelName: "GraphModel",
                timestamps: false,
                indexes: [
                    { fields: ["id_owner_user"], name: "idx_gm_owner" },
                    { unique: true, fields: ["id_owner_user", "name_model"], name: "uq_gm_owner_name" },
                ],
            }
        );
        return GraphModel;
    }

    static associate(models: any) {
        logger.debug("[GraphModel] Registering associations...");

        GraphModel.belongsTo(models.GraphUser, { foreignKey: "id_owner_user", as: "owner", onDelete: "CASCADE" });
        GraphModel.hasMany(models.GraphVersion, { foreignKey: "id_model", as: "versions", onDelete: "CASCADE" });
        GraphModel.hasMany(models.GraphWeightChangeRequest, { foreignKey: "id_model", as: "weightChangeRequests", onDelete: "CASCADE" });
        GraphModel.hasMany(models.GraphSimulation, { foreignKey: "id_model", as: "simulations", onDelete: "CASCADE" });
    }
}
