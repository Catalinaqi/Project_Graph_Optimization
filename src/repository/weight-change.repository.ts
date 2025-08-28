import type { Tx } from "@/common/types";
import WeightChangeDao from "@/dao/weight-change.dao";
import ModelDao from "@/dao/model.dao";
import { GraphRequestStatusEnum } from "@/common/enums";

export async function createRequest(
  args: {
    modelId: number;
    requesterUserId: number;
    from: string;
    to: string;
    weight: number;
  },
  opt?: Tx,
) {
  return WeightChangeDao.create(
    {
      id_model: args.modelId,
      requester_user_id: args.requesterUserId,
      from_node: args.from,
      to_node: args.to,
      suggested_weight: args.weight,
    },
    opt,
  );
}

export const listRequests = (
  modelId: number,
  filters: {
    status?:
      | GraphRequestStatusEnum.PENDING
      | GraphRequestStatusEnum.APPROVED
      | GraphRequestStatusEnum.REJECTED;
    fromDate?: Date;
    toDate?: Date;
  },
  opt?: Tx,
) => WeightChangeDao.list(modelId, filters, opt);

export const findRequest = (requestId: number, opt?: Tx) =>
  WeightChangeDao.findById(requestId, opt);

export async function createNewVersionFrom(
  modelId: number,
  baseVersionNumber: number,
  newGraph: object,
  nodeCount: number,
  edgeCount: number,
  alphaUsed: string | null,
  creatorUserId: number,
  opt?: Tx,
) {
  await ModelDao.createVersion(
    {
      id_model: modelId,
      version_number_version: baseVersionNumber + 1,
      graph_version: newGraph,
      node_count_version: nodeCount,
      edge_count_version: edgeCount,
      alpha_used_version: alphaUsed,
      id_creator_user: creatorUserId,
    } as any,
    opt,
  );

  await (
    await import("@/model/graph.model")
  ).GraphModel.update(
    {
      current_version_model: baseVersionNumber + 1,
      updated_at_model: new Date(),
    } as any,
    { where: { id_model: modelId }, transaction: opt?.transaction },
  );
}
