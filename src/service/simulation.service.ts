import { SimulationFacade } from "./simulation/simulation-facade";
import { ModelRepository } from "@/repository/model.repository";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";
import logger from "@/config/logger";
const facade = new SimulationFacade();

const repo = new ModelRepository();
export async function simulateEdge(args: {
  modelId: number;
  from: string;
  to: string;
  start: number;
  stop: number;
  step: number;
  origin: string;
  goal: string;
  userId: number;
}) {
  if (
    [args.start, args.stop, args.step].some(
      (v) => typeof v !== "number" || isNaN(v),
    ) ||
    args.step <= 0 ||
    args.stop <= args.start
  ) {
    throw getError(
      ErrorEnum.BAD_REQUEST_ERROR,
      "Invalid simulation range",
      400,
    );
  }

  const latest = await repo.getLatestVersion(args.modelId);
  if (!latest) {
    throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);
  }

  const baseGraph = latest.graph_version as Record<
    string,
    Record<string, number>
  >;
  if (!baseGraph[args.from] || !baseGraph[args.from][args.to]) {
    throw getError(ErrorEnum.BAD_REQUEST_ERROR, "Edge not found in graph", 400);
  }

  logger.debug("[SimulationService] start facade simulation ...");
  logger.debug(
    "[SimulationService] simulateEdge modelId=%s from=%s to=%s start=%s stop=%s step=%s origin=%s goal=%s userId=%s",
  );

  return await facade.runSimulation(
    {
      // For DB
      id_model: args.modelId,
      version_number_simulation: latest.version_number_version,
      from_node_simulation: args.from,
      to_node_simulation: args.to,
      start_weight_simulation: args.start,
      end_weight_simulation: args.stop,
      step_weight_simulation: args.step,
      created_at_simulation: new Date(),

      // For alghorithm
      from: args.from,
      to: args.to,
      start: args.start,
      stop: args.stop,
      step: args.step,
      baseGraph,
      origin: args.origin,
      goal: args.goal,
    },
    args.userId,
  );
}
