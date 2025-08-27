import { GraphSimulationModel } from "@/model/graph-simulation.model";
import { GraphSimulationResultModel } from "@/model/graph-simulation-result.model";
import { SimulationIrepository } from "@/repository/interfaces/simulation.irepository";
import { SimulationDao } from "@/dao/simulation.dao";
import logger from "@/config/logger";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";
import type { SimulationInput, SimulationResultInput } from "@/common/types";

export class SimulationRepository implements SimulationIrepository {
  private dao: SimulationDao;

  constructor() {
    this.dao = new SimulationDao();
  }

  async saveSimulation(data: SimulationInput): Promise<GraphSimulationModel> {
    try {
      logger.debug(
        "[SimulationRepository] saveSimulation model=%s version=%s user=%s from=%s to=%s",
        data.id_model,
        data.version_number_simulation,
        data.id_user,
        data.from_node_simulation,
        data.to_node_simulation,
      );

      return await this.dao.createSimulation(data);
    } catch (e) {
      logger.error("[SimulationRepository] Error saving simulation", e);
      throw getError(ErrorEnum.DB_ERROR, "Failed to save simulation", 500);
    }
  }

  async saveSimulationResult(
    data: SimulationResultInput,
  ): Promise<GraphSimulationResultModel> {
    try {
      logger.debug(
        "[SimulationRepository] saveSimulationResult simId=%s weight=%s cost=%s",
        data.id_simulation,
        data.tested_weight_simulation_result,
        data.path_cost_simulation_result,
      );
      return await this.dao.createSimulationResult(data);
    } catch (e) {
      logger.error("[SimulationRepository] Error saving simulation result", e);
      throw getError(
        ErrorEnum.DB_ERROR,
        "Failed to save simulation result",
        500,
      );
    }
  }
}
