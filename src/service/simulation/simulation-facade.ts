import { RangeSimulation } from "./range-simulation";
import { NodeDijkstraAdapter } from "./graph-adapter";
import { SimulationRepository } from "@/repository/simulation.repository";
import logger from "@/config/logger";

export class SimulationFacade {
  private repo = new SimulationRepository();
  private algo = new NodeDijkstraAdapter();

  async runSimulation(params: any, userId: number) {
    // Save header
    const simulation = await this.repo.saveSimulation({
      ...params,
      id_user: userId,
      created_at_simulation: new Date(),
    });

    // Execute strategy
    const strategy = new RangeSimulation();
    const results = await strategy.execute(params, this.algo);

    logger.debug(
      "[RangeSimulation] params start=%s stop=%s step=%s from=%s to=%s origin=%s goal=%s",
      params.start,
      params.stop,
      params.step,
      params.from,
      params.to,
      params.origin,
      params.goal,
    );

    // Save results
    for (const r of results) {
      logger.debug(
        "[SimulationFacade] Saving result simId=%s weight=%s cost=%s path=%j",
        simulation.id_simulation,
        r.weight,
        r.cost,
        r.path,
      );

      await this.repo.saveSimulationResult({
        id_simulation: simulation.id_simulation,
        tested_weight_simulation_result: r.weight,
        path_simulation_result: JSON.stringify(r.path),
        path_cost_simulation_result: r.cost,
        execution_time_ms_simulation_result: r.execTime,
        created_at_simulation_result: new Date(),
      });
    }

    logger.debug(
      "[SimulationFacade] execute produced %s raw results",
      results.length,
    );

    // Best result
    const best = results.reduce(
      (b, r) => (r.cost < b.cost ? r : b),
      results[0],
    );

    logger.debug(
      "[SimulationFacade] returning %s results after filtering",
      results.length,
    );
    logger.debug("[SimulationFacade] returning %s results test", best);

    return { simulationId: simulation.id_simulation, results, best };
  }
}
