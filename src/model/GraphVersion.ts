import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class GraphVersion extends Model<InferAttributes<GraphVersion>, InferCreationAttributes<GraphVersion>> {
    declare id_version: string;
    declare id_model: string;
    declare version_number_version: number;
    declare graph_version: Record<string, any>;
    declare node_count_version: number;
    declare edge_count_version: number;
    declare alpha_used_version: string | null; // DECIMAL(3,2)
    declare id_creator_user: string;

    declare created_at_version: Date;

    static initModel(sequelize: Sequelize) {
        GraphVersion.init(
            {
                id_version: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                id_model: { type: DataTypes.UUID, allowNull: false },
                version_number_version: { type: DataTypes.INTEGER, allowNull: false },
                graph_version: { type: DataTypes.JSONB, allowNull: false },
                node_count_version: { type: DataTypes.INTEGER, allowNull: false },
                edge_count_version: { type: DataTypes.INTEGER, allowNull: false },
                alpha_used_version: { type: DataTypes.DECIMAL(3, 2), allowNull: true },
                id_creator_user: { type: DataTypes.UUID, allowNull: false },
                created_at_version: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: 'graph_version',
                modelName: 'GraphVersion',
                timestamps: false,
                underscored: true,
            }
        );
        return GraphVersion;
    }
}
