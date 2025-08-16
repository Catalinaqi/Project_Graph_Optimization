import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { GraphRequestStatusEnum } from '../common/enums';

export class GraphWeightChangeRequest extends Model<
    InferAttributes<GraphWeightChangeRequest>,
    InferCreationAttributes<GraphWeightChangeRequest>
> {
    declare id_weight_change_request: string;
    declare id_model: string;
    declare id_requester_user: string;
    declare from_node_weight_change_request: string;
    declare to_node_weight_change_request: string;
    declare requested_weight_weight_change_request: string; // DECIMAL
    declare status_weight_change_request: GraphRequestStatusEnum;
    declare reason_weight_change_request: string | null;
    declare id_reviewer_user: string | null;
    declare prev_weight_weight_change_request: string | null;
    declare applied_weight_weight_change_request: string | null;
    declare alpha_used_weight_change_request: string | null;

    declare created_at_weight_change_request: Date;
    declare updated_at_weight_change_request: Date;

    static initModel(sequelize: Sequelize) {
        GraphWeightChangeRequest.init(
            {
                id_weight_change_request: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                id_model: { type: DataTypes.UUID, allowNull: false },
                id_requester_user: { type: DataTypes.UUID, allowNull: false },
                from_node_weight_change_request: { type: DataTypes.STRING(255), allowNull: false },
                to_node_weight_change_request: { type: DataTypes.STRING(255), allowNull: false },
                requested_weight_weight_change_request: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                status_weight_change_request: {
                    type: DataTypes.ENUM(...Object.values(GraphRequestStatusEnum)),
                    allowNull: false,
                    defaultValue: GraphRequestStatusEnum.PENDING,
                },
                reason_weight_change_request: { type: DataTypes.TEXT, allowNull: true },
                id_reviewer_user: { type: DataTypes.UUID, allowNull: true },
                prev_weight_weight_change_request: { type: DataTypes.DECIMAL(12, 4), allowNull: true },
                applied_weight_weight_change_request: { type: DataTypes.DECIMAL(12, 4), allowNull: true },
                alpha_used_weight_change_request: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
                created_at_weight_change_request: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                updated_at_weight_change_request: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: 'graph_weight_change_request',
                modelName: 'GraphWeightChangeRequest',
                timestamps: true,
                createdAt: 'created_at_weight_change_request',
                updatedAt: 'updated_at_weight_change_request',
                underscored: true,
            }
        );
        return GraphWeightChangeRequest;
    }
}
