/**
 * GraphUserModel Model
 *
 * Objective:
 * - Manage system users (admin, regular users).
 * - Store authentication credentials and token balance.
 * - Provide a strongly-typed ORM model for queries and CRUD operations.
 *
 * Fields:
 * - id_user (INTEGER): Primary key.
 * - email_user (string): Unique email.
 * - password_user (string): Hashed password.
 * - role_user (GraphRoleUserEnum): User role (`user` or `admin`).
 * - tokens_user (string): Token balance (DECIMAL in DB, mapped as string in TS).
 * - created_at_user (Date): Timestamp of creation.
 * - updated_at_user (Date): Timestamp of last update.
 */

import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";
import { GraphRoleUserEnum } from "@/common/enums";
import logger from "@/config/logger";

export class GraphUserModel extends Model<
    InferAttributes<GraphUserModel>,
    InferCreationAttributes<GraphUserModel>
> {
    declare id_user: number;
    declare email_user: string;
    declare password_user: string;
    declare role_user: GraphRoleUserEnum;
    declare tokens_user: string; // DECIMAL(12,2) returned as string
    declare created_at_user: Date;
    declare updated_at_user: Date;

    /**
     * Initialize the Sequelize model (attributes & options).
     * @param sequelize Sequelize instance used to register the model.
     */
    static initModel(sequelize: Sequelize): typeof GraphUserModel {
        logger.debug("[GraphUserModel] Initializing model...");

        GraphUserModel.init(
            {
                id_user: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
                email_user: { type: DataTypes.STRING(255), allowNull: false, unique: true },
                password_user: { type: DataTypes.STRING(255), allowNull: false },
                role_user: {
                    type: DataTypes.ENUM("user", "admin"), // must match DB enum values
                    allowNull: false,
                    defaultValue: "user",
                },
                tokens_user: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: "0.00" },
                created_at_user: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                updated_at_user: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: "graph_user",
                modelName: "GraphUserModel",
                timestamps: false,
                hooks: {
                    beforeUpdate: (instance) => { instance.updated_at_user = new Date(); },
                },
            }
        );
        return GraphUserModel;
    }

    /**
     * Register associations to other models.
     * @param models Object containing all initialized models.
     */
    static associate(models: any) {
        logger.debug("[GraphUserModel] Registering associations...");

        GraphUserModel.hasMany(models.GraphModel, { foreignKey: "id_owner_user", as: "models", onDelete: "CASCADE" });

        GraphUserModel.hasMany(models.GraphTokenTransaction, {
            foreignKey: "id_user",
            as: "tokenTransactions",
            onDelete: "CASCADE",
        });

        GraphUserModel.hasMany(models.GraphTokenTransaction, {
            foreignKey: "id_performer_user",
            as: "performedTokenTransactions",
            onDelete: "SET NULL",
        });

        GraphUserModel.hasMany(models.GraphVersion, {
            foreignKey: "id_creator_user",
            as: "createdVersions",
            onDelete: "RESTRICT",
        });

        GraphUserModel.hasMany(models.GraphWeightChangeRequest, {
            foreignKey: "id_requester_user",
            as: "weightChangeRequests",
            onDelete: "RESTRICT",
        });

        GraphUserModel.hasMany(models.GraphWeightChangeRequest, {
            foreignKey: "id_reviewer_user",
            as: "reviewedWeightChangeRequests",
            onDelete: "SET NULL",
        });

        GraphUserModel.hasMany(models.GraphSimulation, {
            foreignKey: "id_user",
            as: "simulations",
            onDelete: "RESTRICT",
        });
    }
}
