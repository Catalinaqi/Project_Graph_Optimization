import type { Tx } from "@/common/types";
import type { GraphModel } from "@/model/graph.model";
import type { GraphVersionModel } from "@/model/graph-version.model";

export interface ModelIdao {
  /**
   * Create a new graph model.
   *  **/
  createModel(data: Partial<GraphModel>, opt?: Tx): Promise<GraphModel>;

  /**
   * Create a new version for a graph model.
   *  **/
  createVersion(
    data: Partial<GraphVersionModel>,
    opt?: Tx,
  ): Promise<GraphVersionModel>;

  /**
   * Find a graph model by its primary key (ID).
   *  **/
  findModelByPk(id: number, opt?: Tx): Promise<GraphModel | null>;

  /**
   * Find a graph version by model ID and version number.
   *  **/
  findVersion(
    modelId: number,
    version: number,
    opt?: Tx,
  ): Promise<GraphVersionModel | null>;

  /**
   * Find the latest version of a graph model by model ID.
   *  **/
  findLatestVersion(
    modelId: number,
    opt?: Tx,
  ): Promise<GraphVersionModel | null>;
}
