import { Sequelize } from 'sequelize';
import { GraphUser } from './GraphUser';
import { GraphTokenTransaction } from './GraphTokenTransaction';
import { GraphModel } from './GraphModel';
import { GraphVersion } from './GraphVersion';
import { GraphWeightChangeRequest } from './GraphWeightChangeRequest';
import { GraphSimulation } from './GraphSimulation';
import { GraphSimulationResult } from './GraphSimulationResult';

export function initModels(sequelize: Sequelize) {
    // Init
    GraphUser.initModel(sequelize);
    GraphTokenTransaction.initModel(sequelize);
    GraphModel.initModel(sequelize);
    GraphVersion.initModel(sequelize);
    GraphWeightChangeRequest.initModel(sequelize);
    GraphSimulation.initModel(sequelize);
    GraphSimulationResult.initModel(sequelize);

    // Associations
    // User -> Model (owner)
    GraphUser.hasMany(GraphModel, { foreignKey: 'id_owner_user', as: 'models' });
    GraphModel.belongsTo(GraphUser, { foreignKey: 'id_owner_user', as: 'owner' });

    // Model -> Version
    GraphModel.hasMany(GraphVersion, { foreignKey: 'id_model', as: 'versions' });
    GraphVersion.belongsTo(GraphModel, { foreignKey: 'id_model', as: 'model' });

    // Version -> Creator (User)
    GraphUser.hasMany(GraphVersion, { foreignKey: 'id_creator_user', as: 'createdVersions' });
    GraphVersion.belongsTo(GraphUser, { foreignKey: 'id_creator_user', as: 'creator' });

    // TokenTransaction -> User
    GraphUser.hasMany(GraphTokenTransaction, { foreignKey: 'id_user', as: 'tokenTransactions' });
    GraphTokenTransaction.belongsTo(GraphUser, { foreignKey: 'id_user', as: 'targetUser' });

    // TokenTransaction -> Performer (User)
    GraphUser.hasMany(GraphTokenTransaction, { foreignKey: 'id_performer_user', as: 'performedTokenTransactions' });
    GraphTokenTransaction.belongsTo(GraphUser, { foreignKey: 'id_performer_user', as: 'performerUser' });

    // WeightChangeRequest -> Model / Users
    GraphModel.hasMany(GraphWeightChangeRequest, { foreignKey: 'id_model', as: 'weightChangeRequests' });
    GraphWeightChangeRequest.belongsTo(GraphModel, { foreignKey: 'id_model', as: 'model' });

    GraphUser.hasMany(GraphWeightChangeRequest, { foreignKey: 'id_requester_user', as: 'requestedWeightChanges' });
    GraphWeightChangeRequest.belongsTo(GraphUser, { foreignKey: 'id_requester_user', as: 'requester' });

    GraphUser.hasMany(GraphWeightChangeRequest, { foreignKey: 'id_reviewer_user', as: 'reviewedWeightChanges' });
    GraphWeightChangeRequest.belongsTo(GraphUser, { foreignKey: 'id_reviewer_user', as: 'reviewer' });

    // Simulation -> Model / User
    GraphModel.hasMany(GraphSimulation, { foreignKey: 'id_model', as: 'simulations' });
    GraphSimulation.belongsTo(GraphModel, { foreignKey: 'id_model', as: 'model' });

    GraphUser.hasMany(GraphSimulation, { foreignKey: 'id_user', as: 'simulations' });
    GraphSimulation.belongsTo(GraphUser, { foreignKey: 'id_user', as: 'user' });

    // SimulationResult -> Simulation
    GraphSimulation.hasMany(GraphSimulationResult, { foreignKey: 'id_simulation', as: 'results' });
    GraphSimulationResult.belongsTo(GraphSimulation, { foreignKey: 'id_simulation', as: 'simulation' });

    return {
        GraphUser,
        GraphTokenTransaction,
        GraphModel,
        GraphVersion,
        GraphWeightChangeRequest,
        GraphSimulation,
        GraphSimulationResult,
    };
}
