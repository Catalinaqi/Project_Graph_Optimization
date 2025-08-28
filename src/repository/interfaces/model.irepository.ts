import type { Tx } from "@/common/types";
import type { GraphVersionModel } from "@/model/graph-version.model";

export interface ModelIrepository {
  /**
   * Creates a new model along with its initial version in a single transaction.
   * **/
  createModelWithVersion(
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
    opt?: Tx,
  ): Promise<{ modelId: number; versionId: number; createdAt: Date }>;

  /**
   * Gets the latest version of a model by its ID.
   * **/
  getLatestVersion(
    modelId: number,
    opt?: Tx,
  ): Promise<GraphVersionModel | null>;
  /**
   * Gets a model by its ID.
   * **/
  getModel(modelId: number, opt?: Tx): Promise<any | null>;
}
