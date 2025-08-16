import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class GraphSimulationResult extends Model<
    InferAttributes<GraphSimulationResult>,
    InferCreationAttributes<GraphSimulationResult>
> {
    declare id_simulation_result: string;
    declare id_simulation: string;
    declare tested_weight_simulation_result: string; // DECIMAL
    declare path_simulation_result: any[];
    declare path_cost_simulation_result: string; // DECIMAL
    declare execution_time_ms_simulation_result: string; // DECIMAL
    declare created_at_simulation_result: Date;

    static initModel(sequelize: Sequelize) {
        GraphSimulationResult.init(
            {
                id_simulation_result: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                id_simulation: { type: DataTypes.UUID, allowNull: false },
                tested_weight_simulation_result: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                path_simulation_result: { type: DataTypes.JSONB, allowNull: false },
                path_cost_simulation_result: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                execution_time_ms_simulation_result: { type: DataTypes.DECIMAL(12, 4), allowNull: false },
                created_at_simulation_result: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: 'graph_simulation_result',
                modelName: 'GraphSimulationResult',
                timestamps: false,
                underscored: true,
            }
        );
        return GraphSimulationResult;
    }
}
