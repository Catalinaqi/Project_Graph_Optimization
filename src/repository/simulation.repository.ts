// src/repository/simulation.repository.ts
import { GraphSimulation } from "@/model/GraphSimulation";
import { GraphSimulationResult } from "@/model/GraphSimulationResult";
import { ISimulationRepository } from "./repository-interface/ISimulationRepository";
import { SimulationDao } from "@/dao/SimulationDao";
import logger from "@/config/logger";
import { getError } from "@/common/util/api.error.util";
import { ErrorEnum } from "@/common/enums";
import type { SimulationInput, SimulationResultInput } from "@/common/types";

export class SimulationRepository implements ISimulationRepository {
    private dao: SimulationDao;

    constructor() {
        this.dao = new SimulationDao();
    }

    async saveSimulation(data: SimulationInput): Promise<GraphSimulation> {
        try {
            logger.debug(
                "[SimulationRepository] saveSimulation model=%s version=%s user=%s from=%s to=%s",
                data.id_model, data.version_number_simulation, data.id_user,
                data.from_node_simulation, data.to_node_simulation
            );

            return await this.dao.createSimulation(data);
        } catch (e) {
            logger.error("[SimulationRepository] Error saving simulation", e);
            throw getError(ErrorEnum.DB_ERROR, "Failed to save simulation", 500);
        }
    }

    async saveSimulationResult(data: SimulationResultInput): Promise<GraphSimulationResult> {
        try {
            logger.debug(
                "[SimulationRepository] saveSimulationResult simId=%s weight=%s cost=%s",
                data.id_simulation, data.tested_weight_simulation_result, data.path_cost_simulation_result
            );
            return await this.dao.createSimulationResult(data);
        } catch (e) {
            logger.error("[SimulationRepository] Error saving simulation result", e);
            throw getError(ErrorEnum.DB_ERROR, "Failed to save simulation result", 500);
        }
    }
}
