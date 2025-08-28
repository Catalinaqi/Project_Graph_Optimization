import { GraphSimulationModel } from "@/model/graph-simulation.model";
import { GraphSimulationResultModel } from "@/model/graph-simulation-result.model";

export interface SimulationIrepository {
  /**
   * Saves a new simulation record to the database.
   * **/
  saveSimulation(data: any): Promise<GraphSimulationModel>;
  /**
   * Saves a new simulation result record to the database.
   * **/
  saveSimulationResult(data: any): Promise<GraphSimulationResultModel>;
}
