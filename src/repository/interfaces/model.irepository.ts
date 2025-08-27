import type { Tx } from "@/common/types";
import type { GraphVersionModel } from "@/model/graph-version.model";

export interface ModelIrepository {
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

    getLatestVersion(modelId: number, opt?: Tx): Promise<GraphVersionModel | null>;
    getModel(modelId: number, opt?: Tx): Promise<any | null>;
}
