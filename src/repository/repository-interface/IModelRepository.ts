import type { Tx } from "@/common/types";
import type { GraphVersion } from "@/model/GraphVersion";

export interface IModelRepository {
    createModelWithVersion(args: {
        ownerUserId: number;
        name: string;
        description: string | null;
        versionNumber: number;
        graph: object;
        nodeCount: number;
        edgeCount: number;
        alphaUsed: string | null;
    }, opt?: Tx): Promise<{ modelId: number; versionId: number; createdAt: Date }>;

    getLatestVersion(modelId: number, opt?: Tx): Promise<GraphVersion | null>;
    getModel(modelId: number, opt?: Tx): Promise<any | null>;
}
