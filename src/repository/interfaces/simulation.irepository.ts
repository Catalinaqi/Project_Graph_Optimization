// src/repository/interfaces/SimulationIrepository.ts
import { GraphSimulationModel } from "@/model/graph-simulation.model";
import { GraphSimulationResultModel } from "@/model/graph-simulation-result.model";

export interface SimulationIrepository {
    saveSimulation(data: any): Promise<GraphSimulationModel>;
    saveSimulationResult(data: any): Promise<GraphSimulationResultModel>;
}
