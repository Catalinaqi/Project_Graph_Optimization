import { SimulationIdao } from "@/dao/interfaces/simulation.idao";
import { GraphSimulationModel } from "@/model/graph-simulation.model";
import { GraphSimulationResultModel } from "@/model/graph-simulation-result.model";
import logger from "@/config/logger";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";
import type { Tx } from "@/common/types";
import type { SimulationInput, SimulationResultInput } from "@/common/types";
export class SimulationDao implements SimulationIdao {
  async createSimulation(
    data: SimulationInput,
    opt?: Tx,
  ): Promise<GraphSimulationModel> {
    try {
      logger.debug(
        "[SimulationDao] createSimulation model=%s version=%s user=%s from=%s to=%s",
        data.id_model,
        data.version_number_simulation,
        data.id_user,
        data.from_node_simulation,
        data.to_node_simulation,
      );

      return await GraphSimulationModel.create(data as any, opt);
    } catch (e) {
      logger.error("[SimulationDao] Error creating simulation", e);
      throw getError(ErrorEnum.DB_ERROR, "Failed to create simulation", 500);
    }
  }

  async createSimulationResult(
    data: SimulationResultInput,
    opt?: Tx,
  ): Promise<GraphSimulationResultModel> {
    try {
      logger.debug(
        "[SimulationDao] createSimulationResult simId=%s weight=%s cost=%s",
        data.id_simulation,
        data.tested_weight_simulation_result,
        data.path_cost_simulation_result,
      );

      return await GraphSimulationResultModel.create(data as any, opt);
    } catch (e) {
      logger.error("[SimulationDao] Error creating simulation result", e);
      throw getError(
        ErrorEnum.DB_ERROR,
        "Failed to create simulation result",
        500,
      );
    }
  }
}
