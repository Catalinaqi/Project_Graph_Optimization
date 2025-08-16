import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class GraphTokenTransaction extends Model<
    InferAttributes<GraphTokenTransaction>,
    InferCreationAttributes<GraphTokenTransaction>
> {
    declare id_token_transaction: string;
    declare id_user: string;
    declare id_performer_user: string | null;

    declare prev_tokens_token_transaction: string; // DECIMAL
    declare new_tokens_token_transaction: string;  // DECIMAL
    declare diff_tokens_token_transaction: string; // DECIMAL
    declare reason_token_transaction: string | null;

    declare created_at_token_transaction: Date;

    static initModel(sequelize: Sequelize) {
        GraphTokenTransaction.init(
            {
                id_token_transaction: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                id_user: { type: DataTypes.UUID, allowNull: false },
                id_performer_user: { type: DataTypes.UUID, allowNull: true },
                prev_tokens_token_transaction: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
                new_tokens_token_transaction: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
                diff_tokens_token_transaction: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
                reason_token_transaction: { type: DataTypes.TEXT, allowNull: true },
                created_at_token_transaction: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: 'graph_token_transaction',
                modelName: 'GraphTokenTransaction',
                timestamps: false,
                underscored: true,
            }
        );
        return GraphTokenTransaction;
    }
}
