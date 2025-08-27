import { Sequelize } from "sequelize";
import Database from "@/database/database";
import environment from "@/config/enviroment";
import { getError } from "@/common/util/api-error";
import { ErrorEnum, GraphRequestStatusEnum } from "@/common/enums";
import { ModelRepository } from "@/repository/model.repository";
import {
  createNewVersionFrom,
  createRequest,
  listRequests,
  findRequest,
} from "@/repository/weight-change.repository";

const sequelize: Sequelize = Database.getInstance();

const repo = new ModelRepository();

function applyEma(prev: number, proposed: number, alpha: number) {
  return alpha * prev + (1 - alpha) * proposed;
}

export async function requestWeightChange(args: {
  modelId: number;
  from: string;
  to: string;
  weight: number;
  requesterUserId: number;
}) {
  const latest = await repo.getLatestVersion(args.modelId);
  if (!latest)
    throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);

  const graph = latest.graph_version as Record<string, Record<string, number>>;
  if (!graph[args.from] || !graph[args.from][args.to]) {
    throw getError(ErrorEnum.BAD_REQUEST_ERROR, "Edge not found in graph", 400);
  }

  return createRequest({
    modelId: args.modelId,
    requesterUserId: args.requesterUserId,
    from: args.from,
    to: args.to,
    weight: Number(args.weight.toFixed(2)),
  });
}

export const listWeightChanges = (
  modelId: number,
  filters: {
    status?:
      | GraphRequestStatusEnum.PENDING
      | GraphRequestStatusEnum.APPROVED
      | GraphRequestStatusEnum.REJECTED;
    fromDate?: Date;
    toDate?: Date;
  },
) => listRequests(modelId, filters);

export async function approveRequest(args: {
  modelId: number;
  requestId: number;
  approverUserId: number;
}) {
  const graphAlphaKey = environment.graphAlphaKey;

  return sequelize.transaction(async (t) => {
    const latest = await repo.getLatestVersion(args.modelId, {
      transaction: t,
    });
    if (!latest)
      throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);

    const req = await findRequest(args.requestId, { transaction: t });
    if (
      !req ||
      req.id_model !== args.modelId ||
      req.status !== GraphRequestStatusEnum.PENDING
    ) {
      throw getError(
        ErrorEnum.NOT_FOUND_ERROR,
        "Request not found or already processed",
        404,
      );
    }

    const graph = latest.graph_version as Record<
      string,
      Record<string, number>
    >;
    const from = req.from_node;
    const to = req.to_node;
    const prev = Number(graph[from]?.[to]);
    if (!Number.isFinite(prev))
      throw getError(
        ErrorEnum.BAD_REQUEST_ERROR,
        "Edge not found in graph",
        400,
      );

    const next = Number(
      applyEma(prev, Number(req.suggested_weight), graphAlphaKey).toFixed(2),
    );

    const newGraph = { ...graph, [from]: { ...graph[from], [to]: next } };

    await createNewVersionFrom(
      args.modelId,
      latest.version_number_version,
      newGraph,
      Object.keys(newGraph).length,
      Object.values(newGraph).reduce(
        (a, o: any) => a + Object.keys(o || {}).length,
        0,
      ),
      String(graphAlphaKey),
      args.approverUserId,
      { transaction: t },
    );

    const approve = await import("@/dao/weight-change.dao");

    const updated = await (
      await import("@/dao/weight-change.dao")
    ).default.approve(req.id_weight_change_request, { transaction: t });
    if (updated !== 1)
      throw getError(ErrorEnum.GENERIC_ERROR, "Failed to approve request", 409);

    return { from, to, previous: prev, next, graphAlphaKey };
  });
}

export async function rejectRequest(args: {
  modelId: number;
  requestId: number;
  reason: string;
  approverUserId: number;
}) {
  return sequelize.transaction(async (t) => {
    const req = await findRequest(args.requestId, { transaction: t });
    if (
      !req ||
      req.id_model !== args.modelId ||
      req.status !== GraphRequestStatusEnum.PENDING
    ) {
      throw getError(
        ErrorEnum.NOT_FOUND_ERROR,
        "Request not found or already processed",
        404,
      );
    }
    const updated = await (
      await import("@/dao/weight-change.dao")
    ).default.reject(req.id_weight_change_request, args.reason, {
      transaction: t,
    });
    if (updated !== 1)
      throw getError(ErrorEnum.GENERIC_ERROR, "Failed to reject request", 409);
    return { ok: true };
  });
}

export async function listVersions(
  modelId: number,
  filters: {
    fromDate?: Date;
    toDate?: Date;
    nodeCount?: number;
    edgeCount?: number;
  },
) {
  const { Op } = await import("sequelize");
  const { GraphVersionModel } = await import("@/model/graph-version.model");
  const where: any = { id_model: modelId };
  if (filters.fromDate)
    where.created_at_version = {
      ...(where.created_at_version || {}),
      [Op.gte]: filters.fromDate,
    };
  if (filters.toDate)
    where.created_at_version = {
      ...(where.created_at_version || {}),
      [Op.lte]: filters.toDate,
    };
  if (filters.nodeCount != null) where.node_count_version = filters.nodeCount;
  if (filters.edgeCount != null) where.edge_count_version = filters.edgeCount;

  return GraphVersionModel.findAll({
    where,
    order: [["version_number_version", "DESC"]],
  });
}
