import type { Tx } from "@/common/types";
import ModelDao from "@/dao/ModelDao";
import { GraphModel } from "@/model/GraphModel";
import { GraphVersion } from "@/model/GraphVersion";

export async function createModelWithVersion(
    args: {
        ownerUserId: number;
        name: string;
        description: string | null;
        versionNumber: number;
        graph: object;
        nodeCount: number;
        edgeCount: number;
        alphaUsed: string | null;
    },
    opt?: Tx
): Promise<{ modelId: number; versionId: number; createdAt: Date }> {
    const model = await ModelDao.createModel(
        {
            id_owner_user: args.ownerUserId,
            name_model: args.name,
            description_model: args.description,
            current_version_model: args.versionNumber,
        } as Partial<GraphModel>,
        opt
    );

    const version = await ModelDao.createVersion(
        {
            id_model: model.id_model,
            version_number_version: args.versionNumber,
            graph_version: args.graph,
            node_count_version: args.nodeCount,
            edge_count_version: args.edgeCount,
            alpha_used_version: args.alphaUsed,
            id_creator_user: args.ownerUserId,
        } as Partial<GraphVersion>,
        opt
    );

    return { modelId: model.id_model, versionId: version.id_version, createdAt: model.created_at_model };
}

export async function getLatestVersion(modelId: number, opt?: Tx) {
    const model = await ModelDao.findModelByPk(modelId, opt);
    if (!model) return null;
    // si confías en current_version_model:
    const v = await ModelDao.findVersion(modelId, model.current_version_model, opt);
    return v ?? ModelDao.findLatestVersion(modelId, opt);
}

export async function getModel(modelId: number, opt?: Tx) {
    return ModelDao.findModelByPk(modelId, opt);
}
