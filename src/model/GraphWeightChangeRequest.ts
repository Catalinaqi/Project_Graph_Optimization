/***
 GraphWeightChangeRequest Model
 *
 * Object representing a request to change the weight of an edge in a graph model.
 * Fields:
 * - id_weight_change_request (INTEGER): Primary key.
 * - id_model (INTEGER): FK → graph_model.id_model.
 * - id_requester_user (INTEGER): FK → graph_user.id_user (who made the request).
 * - from_node_weight_change_request (string): Source node label of the edge.
 * - to_node_weight_change_request (string): Target node label of the edge.
 * - requested_weight_weight_change_request (string): New weight value requested (DECIMAL in DB, string in TS).
 * - status_weight_change_request (ENUM): Request status (PENDING, APPROVED, REJECTED).
 * - reason_weight_change_request (string|null): Reason for approval/rejection.
 * - id_reviewer_user (INTEGER|null): FK → graph_user.id_user (who reviewed the request).
 * - prev_weight_weight_change_request (string|null): Previous weight before change (DECIMAL in DB, string in TS).
 * - applied_weight_weight_change_request (string|null): Weight applied if approved (DECIMAL in DB, string in TS).
 * - alpha_used_weight_change_request (string|null): Alpha used during application (DECIMAL in DB, string in TS).
 * - created_at_weight_change_request (Date): Timestamp of creation.
 * - updated_at_weight_change_request (Date): Timestamp of last update.

 */

import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
} from "sequelize";
import { GraphRequestStatusEnum } from "@/common/enums";
import logger from "@/config/logger";

export class GraphWeightChangeRequest extends Model<
    InferAttributes<GraphWeightChangeRequest>,
    InferCreationAttributes<GraphWeightChangeRequest>
> {
    declare id_weight_change_request: number;
    declare id_model: number;
    declare requester_user_id: number;          // <-- alias
    declare from_node: string;                  // <-- alias
    declare to_node: string;                    // <-- alias
    declare suggested_weight: string;           // <-- alias
    declare status: GraphRequestStatusEnum;
    declare reason: string | null;
    declare reviewer_user_id: number | null;    // <-- alias
    declare prev_weight: string | null;         // <-- alias
    declare applied_weight: string | null;      // <-- alias
    declare alpha_used: string | null;          // <-- alias
    declare created_at: Date;
    declare updated_at: Date;

    static initModel(sequelize: Sequelize): typeof GraphWeightChangeRequest {
        logger.debug("[GraphWeightChangeRequest] Initializing model...");

        GraphWeightChangeRequest.init(
            {
                id_weight_change_request: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                id_model: { type: DataTypes.INTEGER, allowNull: false },

                requester_user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: "id_requester_user",
                },
                from_node: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    field: "from_node_weight_change_request",
                },
                to_node: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    field: "to_node_weight_change_request",
                },
                suggested_weight: {
                    type: DataTypes.DECIMAL(12, 2),
                    allowNull: false,
                    field: "requested_weight_weight_change_request",
                },

                status: {
                    type: DataTypes.ENUM(
                        GraphRequestStatusEnum.PENDING,
                        GraphRequestStatusEnum.APPROVED,
                        GraphRequestStatusEnum.REJECTED
                    ),
                    allowNull: false,
                    defaultValue: GraphRequestStatusEnum.PENDING,
                    field: "status_weight_change_request",
                },
                reason: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: "reason_weight_change_request",
                },
                reviewer_user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: "id_reviewer_user",
                },
                prev_weight: {
                    type: DataTypes.DECIMAL(12, 4),
                    allowNull: true,
                    field: "prev_weight_weight_change_request",
                },
                applied_weight: {
                    type: DataTypes.DECIMAL(12, 4),
                    allowNull: true,
                    field: "applied_weight_weight_change_request",
                },
                alpha_used: {
                    type: DataTypes.DECIMAL(3, 2),
                    allowNull: true,
                    field: "alpha_used_weight_change_request",
                },

                created_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                    field: "created_at_weight_change_request",
                },
                updated_at: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                    field: "updated_at_weight_change_request",
                },
            },
            {
                sequelize,
                tableName: "graph_weight_change_request",
                modelName: "GraphWeightChangeRequest",
                timestamps: false,
                indexes: [
                    {
                        fields: ["id_model", "status_weight_change_request", "created_at_weight_change_request"],
                        name: "idx_wcr_model_status_date",
                    },
                    { fields: ["id_requester_user"], name: "idx_wcr_requester" },
                ],
            }
        );

        return GraphWeightChangeRequest;
    }

    static associate(models: any) {
        logger.debug("[GraphWeightChangeRequest] Registering associations...");

        GraphWeightChangeRequest.belongsTo(models.GraphModel, {
            foreignKey: "id_model",
            as: "model",
            onDelete: "CASCADE",
        });
        GraphWeightChangeRequest.belongsTo(models.GraphUser, {
            foreignKey: "id_requester_user",
            as: "requester",
            onDelete: "RESTRICT",
        });
        GraphWeightChangeRequest.belongsTo(models.GraphUser, {
            foreignKey: "id_reviewer_user",
            as: "reviewer",
            onDelete: "SET NULL",
        });
    }
}
