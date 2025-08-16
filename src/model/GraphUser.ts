import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { GraphRoleUserEnum } from '@/common/enums';

/**
 * 👤 Modello Sequelize: GraphUser
 *
 * Descrizione generale:
 * - Rappresenta la tabella `graph_user` nel database.
 * - Gestisce gli utenti del sistema con i campi principali:
 *   🔹 id (UUID)
 *   🔹 email
 *   🔹 password hashata
 *   🔹 ruolo (user/admin)
 *   🔹 saldo token
 *   🔹 timestamp di creazione/aggiornamento
 *
 * Note:
 * - `tokens_user` è definito come DECIMAL in DB → gestito come stringa in TS.
 * - `role_user` è tipizzato con `GraphRoleUserEnum` per garantire valori validi.
 */
export class GraphUser extends Model<InferAttributes<GraphUser>, InferCreationAttributes<GraphUser>> {
    declare id_user: string;
    declare email_user: string;
    declare password_user: string;
    declare role_user: GraphRoleUserEnum;
    declare tokens_user: string; // DECIMAL in DB → string per default Sequelize

    declare created_at_user: Date;
    declare updated_at_user: Date;

    /**
     * ⚙️ Inizializzazione del modello
     *
     * Flusso:
     * 1. Definisce i campi della tabella `graph_user` con i rispettivi tipi e vincoli.
     * 2. Configura nome tabella, modelName e mapping dei campi `createdAt` e `updatedAt`.
     * 3. Restituisce il modello pronto da usare nei DAO/Repository.
     *
     * @param sequelize - istanza Sequelize collegata al DB
     */
    static initModel(sequelize: Sequelize) {
        GraphUser.init(
            {
                id_user: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                email_user: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: true,
                },
                password_user: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                role_user: {
                    type: DataTypes.ENUM(...Object.values(GraphRoleUserEnum)),
                    allowNull: false,
                    defaultValue: GraphRoleUserEnum.USER,
                },
                tokens_user: {
                    type: DataTypes.DECIMAL(12, 2),
                    allowNull: false,
                    defaultValue: '0.00',
                },
                created_at_user: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
                updated_at_user: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            },
            {
                sequelize,
                tableName: 'graph_user',
                modelName: 'GraphUser',
                timestamps: true,
                createdAt: 'created_at_user',
                updatedAt: 'updated_at_user',
                underscored: true,
            }
        );
        return GraphUser;
    }
}
