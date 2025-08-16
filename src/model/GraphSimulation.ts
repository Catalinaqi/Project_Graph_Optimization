import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class GraphSimulation extends Model<InferAttributes<GraphSimulation>, InferCreationAttributes<GraphSimulation>> {
    declare id_simulation: string;
    declare id_model: string;
    declare version_number_simulation: number;
    declare id_user: string;

    declare from_node_simulation: string;
    declare to_node_simulation: string;
    declare start_weight_simulation: string; // DECIMAL
    declare end_weight_simulation: string;   // DECIMAL
    declare step_weight_simulation: string;  // DECIMAL

    declare created_at_simulation: Date;

    static initModel(sequelize: Sequelize) {
        GraphSimulation.init(
            {
                id_simulation: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                id_model: { type: DataTypes.UUID, allowNull: false },
                version_number_simulation: { type: DataTypes.INTEGER, allowNull: false },
                id_user: { type: DataTypes.UUID, allowNull: false },
                from_node_simulation: { type: DataTypes.STRING(255), allowNull: false },
                to_node_simulation: { type: DataTypes.STRING(255), allowNull: false },
                start_weight_simulation: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                end_weight_simulation: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                step_weight_simulation: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                created_at_simulation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: 'graph_simulation',
                modelName: 'GraphSimulation',
                timestamps: false,
                underscored: true,
            }
        );
        return GraphSimulation;
    }
}
