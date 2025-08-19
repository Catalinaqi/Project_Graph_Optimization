/**
 * GraphVersion Model
 *
 * Objective:
 * - Store immutable snapshots (versions) of a graph.
 * - Keep counts and metadata for auditing and filtering.
 * - Allow running algorithms against a specific version.
 *
 * Fields:
 * - id_version (INTEGER): Primary key.
 * - id_model (INTEGER): FK → graph_model.id_model.
 * - version_number_version (number): Monotonic version number within a model.
 * - graph_version (JSONB): Serialized graph (nodes/edges with weights).
 * - node_count_version (number): Number of nodes in this snapshot.
 * - edge_count_version (number): Number of edges in this snapshot.
 * - alpha_used_version (string|null): Alpha used (DECIMAL in DB, string in TS).
 * - id_creator_user (INTEGER): FK → graph_user.id_user (who created the version).
 * - created_at_version (Date): Timestamp of creation.
 */

import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import logger from "@/config/logger";

export class GraphVersion extends Model<
    InferAttributes<GraphVersion>,
    InferCreationAttributes<GraphVersion>
> {
    declare id_version: number;
    declare id_model: number;
    declare version_number_version: number;
    declare graph_version: Record<string, unknown>;
    declare node_count_version: number;
    declare edge_count_version: number;
    declare alpha_used_version: string | null;
    declare id_creator_user: number;
    declare created_at_version: Date;

    static initModel(sequelize: Sequelize): typeof GraphVersion {
        logger.debug("[GraphVersion] Initializing model...");

        GraphVersion.init(
            {
                id_version: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
                id_model: { type: DataTypes.INTEGER, allowNull: false },
                version_number_version: { type: DataTypes.INTEGER, allowNull: false },
                graph_version: { type: DataTypes.JSONB, allowNull: false },
                node_count_version: { type: DataTypes.INTEGER, allowNull: false },
                edge_count_version: { type: DataTypes.INTEGER, allowNull: false },
                alpha_used_version: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
                id_creator_user: { type: DataTypes.INTEGER, allowNull: false },
                created_at_version: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: "graph_version",
                modelName: "GraphVersion",
                timestamps: false,
                indexes: [
                    { unique: true, fields: ["id_model", "version_number_version"], name: "uq_gv_model_version" },
                    { fields: ["id_model", "created_at_version"], name: "idx_gv_model_created_at" },
                    { fields: ["node_count_version", "edge_count_version"], name: "idx_gv_counts" },
                ],
            }
        );
        return GraphVersion;
    }

    static associate(models: any) {
        logger.debug("[GraphVersion] Registering associations...");

        GraphVersion.belongsTo(models.GraphModel, { foreignKey: "id_model", as: "model", onDelete: "CASCADE" });
        GraphVersion.belongsTo(models.GraphUser, { foreignKey: "id_creator_user", as: "creator", onDelete: "RESTRICT" });
    }
}
