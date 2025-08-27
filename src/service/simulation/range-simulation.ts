// src/service/simulation/range-simulation.ts
import { ISimulationStrategy, SimulationArgs } from "./simulation-strategy";
import { IGraphAlgorithmAdapter } from "./graph-adapter";
import { performance } from "perf_hooks";
import logger from "@/config/logger";
export class RangeSimulation implements ISimulationStrategy {
    /*
    async execute(args: SimulationArgs, algo: IGraphAlgorithmAdapter) {
        const results: Array<{ weight: number; path: string[]; cost: number; execTime: number }> = [];

        //logger.debug("[RangeSimulation] Running from=%s to=%s step=%s", start, stop, step);

        for (let w = args.start; w <= args.stop + 1e-9; w = Number((w + args.step).toFixed(10))) {
            const g = JSON.parse(JSON.stringify(args.baseGraph));
            g[args.from][args.to] = Number(w.toFixed(2));

            const startTime = performance.now();
            const res = algo.findPath(g, args.origin, args.goal);
            const endTime = performance.now();

            results.push({
                weight: Number(w.toFixed(2)),
                path: res?.path || [],
                cost: res?.cost ?? Infinity,
                execTime: Math.round(endTime - startTime),
            });
        }

        return results;
    }*/


    async execute(args: SimulationArgs, algo: IGraphAlgorithmAdapter) {
        const results: Array<{ weight: number; path: string[]; cost: number; execTime: number }> = [];

        const start = Number(args.start);
        const stop = Number(args.stop);
        const step = Number(args.step);

        logger.debug("[RangeSimulation] start=%s stop=%s step=%s", start, stop, step);

        if (isNaN(start) || isNaN(stop) || isNaN(step)) {
            logger.error("[RangeSimulation] Invalid parameters -> start=%s stop=%s step=%s", args.start, args.stop, args.step);
            return results;
        }

        for (let w = start; w <= stop + 1e-9; w = Number((w + step).toFixed(10))) {
            const g = JSON.parse(JSON.stringify(args.baseGraph));
            g[args.from][args.to] = Number(w.toFixed(2));

            const startTime = performance.now();
            const res = algo.findPath(g, args.origin, args.goal);
            const endTime = performance.now();

            results.push({
                weight: Number(w.toFixed(2)),
                path: res?.path || [],
                cost: res?.cost ?? Infinity,
                execTime: Math.round(endTime - startTime),
            });
        }

        return results;
    }


}
