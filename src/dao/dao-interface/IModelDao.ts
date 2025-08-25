import type { Tx } from "@/common/types";
import type { GraphModel } from "@/model/GraphModel";
import type { GraphVersion } from "@/model/GraphVersion";

export interface IModelDao {
    createModel(data: Partial<GraphModel>, opt?: Tx): Promise<GraphModel>;
    createVersion(data: Partial<GraphVersion>, opt?: Tx): Promise<GraphVersion>;
    findModelByPk(id: number, opt?: Tx): Promise<GraphModel | null>;
    findVersion(modelId: number, version: number, opt?: Tx): Promise<GraphVersion | null>;
    findLatestVersion(modelId: number, opt?: Tx): Promise<GraphVersion | null>;
}
