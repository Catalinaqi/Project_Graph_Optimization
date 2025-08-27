import type { Tx } from "@/common/types";
import type { GraphModel } from "@/model/graph.model";
import type { GraphVersionModel } from "@/model/graph-version.model";

export interface ModelIdao {
    createModel(data: Partial<GraphModel>, opt?: Tx): Promise<GraphModel>;
    createVersion(data: Partial<GraphVersionModel>, opt?: Tx): Promise<GraphVersionModel>;
    findModelByPk(id: number, opt?: Tx): Promise<GraphModel | null>;
    findVersion(modelId: number, version: number, opt?: Tx): Promise<GraphVersionModel | null>;
    findLatestVersion(modelId: number, opt?: Tx): Promise<GraphVersionModel | null>;
}
