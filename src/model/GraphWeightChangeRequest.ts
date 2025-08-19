/**
 * GraphWeightChangeRequest Model
 *
 * Objective:
 * - Queue and moderate user requests to change an edge weight.
 * - Track review status, decision data, and applied values.
 * - Enable filtering by model, date, and status.
 *
 * Fields:
 * - id_weight_change_request (INTEGER): Primary key.
 * - id_model (INTEGER): FK → graph_model.id_model.
 * - id_requester_user (INTEGER): FK → graph_user.id_user (who requested).
 * - from_node_weight_change_request (string): Edge source node label.
 * - to_node_weight_change_request (string): Edge target node label.
 * - requested_weight_weight_change_request (string): Proposed weight (DECIMAL in DB, string in TS).
 * - status_weight_change_request (GraphRequestStatusEnum): Review status.
 * - reason_weight_change_request (string|null): Optional requester note.
 * - id_reviewer_user (INTEGER|null): FK → graph_user.id_user (who reviewed).
 * - prev_weight_weight_change_request (string|null): Previous edge weight.
 * - applied_weight_weight_change_request (string|null): Final applied weight.
 * - alpha_used_weight_change_request (string|null): Alpha used for smoothing.
 * - created_at_weight_change_request (Date): Creation timestamp.
 * - updated_at_weight_change_request (Date): Last update timestamp.
 */

import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import { GraphRequestStatusEnum } from "@/common/enums";
import logger from "@/config/logger";

export class GraphWeightChangeRequest extends Model<
    InferAttributes<GraphWeightChangeRequest>,
    InferCreationAttributes<GraphWeightChangeRequest>
> {
    declare id_weight_change_request: number;
    declare id_model: number;
    declare id_requester_user: number;
    declare from_node_weight_change_request: string;
    declare to_node_weight_change_request: string;
    declare requested_weight_weight_change_request: string;
    declare status_weight_change_request: GraphRequestStatusEnum;
    declare reason_weight_change_request: string | null;
    declare id_reviewer_user: number | null;
    declare prev_weight_weight_change_request: string | null;
    declare applied_weight_weight_change_request: string | null;
    declare alpha_used_weight_change_request: string | null;
    declare created_at_weight_change_request: Date;
    declare updated_at_weight_change_request: Date;

    static initModel(sequelize: Sequelize): typeof GraphWeightChangeRequest {
        logger.debug("[GraphWeightChangeRequest] Initializing model...");

        GraphWeightChangeRequest.init(
            {
                id_weight_change_request: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
                id_model: { type: DataTypes.INTEGER, allowNull: false },
                id_requester_user: { type: DataTypes.INTEGER, allowNull: false },
                from_node_weight_change_request: { type: DataTypes.STRING(255), allowNull: false },
                to_node_weight_change_request: { type: DataTypes.STRING(255), allowNull: false },
                requested_weight_weight_change_request: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                status_weight_change_request: {
                    type: DataTypes.ENUM("pending", "approved", "rejected"),
                    allowNull: false,
                    defaultValue: "pending",
                },
                reason_weight_change_request: { type: DataTypes.TEXT, allowNull: true },
                id_reviewer_user: { type: DataTypes.INTEGER, allowNull: true },
                prev_weight_weight_change_request: { type: DataTypes.DECIMAL(12, 4), allowNull: true },
                applied_weight_weight_change_request: { type: DataTypes.DECIMAL(12, 4), allowNull: true },
                alpha_used_weight_change_request: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
                created_at_weight_change_request: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                updated_at_weight_change_request: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: "graph_weight_change_request",
                modelName: "GraphWeightChangeRequest",
                timestamps: false,
                indexes: [
                    { fields: ["id_model", "status_weight_change_request", "created_at_weight_change_request"], name: "idx_wcr_model_status_date" },
                    { fields: ["id_requester_user"], name: "idx_wcr_requester" },
                ],
            }
        );
        return GraphWeightChangeRequest;
    }

    static associate(models: any) {
        logger.debug("[GraphWeightChangeRequest] Registering associations...");

        GraphWeightChangeRequest.belongsTo(models.GraphModel, { foreignKey: "id_model", as: "model", onDelete: "CASCADE" });
        GraphWeightChangeRequest.belongsTo(models.GraphUser, { foreignKey: "id_requester_user", as: "requester", onDelete: "RESTRICT" });
        GraphWeightChangeRequest.belongsTo(models.GraphUser, { foreignKey: "id_reviewer_user", as: "reviewer", onDelete: "SET NULL" });
    }
}
