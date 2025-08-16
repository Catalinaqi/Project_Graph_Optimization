import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class GraphModel extends Model<InferAttributes<GraphModel>, InferCreationAttributes<GraphModel>> {
    declare id_model: string;
    declare id_owner_user: string;
    declare name_model: string;
    declare description_model: string | null;
    declare current_version_model: number;

    declare created_at_model: Date;
    declare updated_at_model: Date;

    static initModel(sequelize: Sequelize) {
        GraphModel.init(
            {
                id_model: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                id_owner_user: { type: DataTypes.UUID, allowNull: false },
                name_model: { type: DataTypes.STRING(255), allowNull: false },
                description_model: { type: DataTypes.TEXT, allowNull: true },
                current_version_model: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
                created_at_model: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                updated_at_model: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: 'graph_model',
                modelName: 'GraphModel',
                timestamps: true,
                createdAt: 'created_at_model',
                updatedAt: 'updated_at_model',
                underscored: true,
            }
        );
        return GraphModel;
    }
}
