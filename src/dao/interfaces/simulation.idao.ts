import { GraphSimulationModel } from "@/model/graph-simulation.model";
import { GraphSimulationResultModel } from "@/model/graph-simulation-result.model";

export interface SimulationIdao {
  /**
   * Create a new graph simulation.
   *  **/
  createSimulation(data: {
    id_model: number;
    version_number_simulation: number;
    id_user: number;
    from_node_simulation: string;
    to_node_simulation: string;
    start_weight_simulation: number;
    end_weight_simulation: number;
    step_weight_simulation: number;
    created_at_simulation: Date;
  }): Promise<GraphSimulationModel>;

  /**
   * Create a new graph simulation result.
   *  **/
  createSimulationResult(data: {
    id_simulation: number;
    tested_weight_simulation_result: number;
    path_simulation_result: string;
    path_cost_simulation_result: number;
    execution_time_ms_simulation_result: number;
    created_at_simulation_result: Date;
  }): Promise<GraphSimulationResultModel>;
}
