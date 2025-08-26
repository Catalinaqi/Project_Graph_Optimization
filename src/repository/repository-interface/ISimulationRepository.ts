// src/repository/interfaces/ISimulationRepository.ts
import { GraphSimulation } from "@/model/GraphSimulation";
import { GraphSimulationResult } from "@/model/GraphSimulationResult";

export interface ISimulationRepository {
    saveSimulation(data: any): Promise<GraphSimulation>;
    saveSimulationResult(data: any): Promise<GraphSimulationResult>;
}
