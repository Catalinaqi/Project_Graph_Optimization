import type { Tx } from "@/common/types";
import { ModelFactoryDao } from "@/dao/model-factory.dao";
import { ModelIrepository } from "@/repository/interfaces/model.irepository";
import { GraphVersionModel } from "@/model/graph-version.model";

const modelDao = ModelFactoryDao.createModelDao();

export class ModelRepository implements ModelIrepository {
    async createModelWithVersion(args: any, opt?: Tx) {
        const model = await modelDao.createModel({
            id_owner_user: args.ownerUserId,
            name_model: args.name,
            description_model: args.description,
            current_version_model: args.versionNumber,
        }, opt);

        const version = await modelDao.createVersion({
            id_model: model.id_model,
            version_number_version: args.versionNumber,
            graph_version: args.graph,
            node_count_version: args.nodeCount,
            edge_count_version: args.edgeCount,
            alpha_used_version: args.alphaUsed,
            id_creator_user: args.ownerUserId,
        }, opt);

        return { modelId: model.id_model, versionId: version.id_version, createdAt: model.created_at_model };
    }

    async getLatestVersion(modelId: number, opt?: Tx): Promise<GraphVersionModel | null> {
        const model = await modelDao.findModelByPk(modelId, opt);
        if (!model) return null;
        return await modelDao.findLatestVersion(modelId, opt);
    }

    async getModel(modelId: number, opt?: Tx) {
        return modelDao.findModelByPk(modelId, opt);
    }
}
