/**
 * GraphTokenTransactionModel Model
 *
 * Objective:
 * - Keep a ledger of token changes per user (charges & recharges).
 * - Provide a verifiable audit trail and enable balance reconstruction.
 *
 * Fields:
 * - id_token_transaction (INTEGER): Primary key.
 * - id_user (INTEGER): FK → graph_user.id_user (token owner).
 * - id_performer_user (INTEGER|null): FK → graph_user.id_user (admin/operator).
 * - prev_tokens_token_transaction (string): Previous balance (DECIMAL in DB, string in TS).
 * - new_tokens_token_transaction (string): New balance after operation (DECIMAL in DB, string in TS).
 * - diff_tokens_token_transaction (string): Delta applied (+/-) (DECIMAL in DB, string in TS).
 * - reason_token_transaction (string|null): Operation reason/comment.
 * - created_at_token_transaction (Date): Timestamp of creation.
 */

import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import logger from "@/config/logger";

export class GraphTokenTransactionModel extends Model<
    InferAttributes<GraphTokenTransactionModel>,
    InferCreationAttributes<GraphTokenTransactionModel>
> {
    declare id_token_transaction: number;
    declare id_user: number;
    declare id_performer_user: number | null;
    declare prev_tokens_token_transaction: string;
    declare new_tokens_token_transaction: string;
    declare diff_tokens_token_transaction: string;
    declare reason_token_transaction: string | null;
    declare created_at_token_transaction: Date;

    static initModel(sequelize: Sequelize): typeof GraphTokenTransactionModel {
        logger.debug("[GraphTokenTransactionModel] Initializing model...");

        GraphTokenTransactionModel.init(
            {
                id_token_transaction: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
                id_user: { type: DataTypes.INTEGER, allowNull: false },
                id_performer_user: { type: DataTypes.INTEGER, allowNull: true },
                prev_tokens_token_transaction: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
                new_tokens_token_transaction: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
                diff_tokens_token_transaction: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
                reason_token_transaction: { type: DataTypes.TEXT, allowNull: true },
                created_at_token_transaction: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: "graph_token_transaction",
                modelName: "GraphTokenTransactionModel",
                timestamps: false,
                indexes: [{ fields: ["id_user", "created_at_token_transaction"], name: "idx_gtt_user_created_at" }],
            }
        );
        return GraphTokenTransactionModel;
    }

    static associate(models: any) {
        logger.debug("[GraphTokenTransactionModel] Registering associations...");

        GraphTokenTransactionModel.belongsTo(models.GraphUser, { foreignKey: "id_user", as: "user", onDelete: "CASCADE" });
        GraphTokenTransactionModel.belongsTo(models.GraphUser, { foreignKey: "id_performer_user", as: "performer", onDelete: "SET NULL" });
    }
}
