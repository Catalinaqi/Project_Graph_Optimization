// src/service/simulation/simulation-strategy.ts
import { IGraphAlgorithmAdapter } from "./graph-adapter";

export interface SimulationArgs {
    baseGraph: any;
    from: string;
    to: string;
    origin: string;
    goal: string;
    start: number;
    stop: number;
    step: number;
}

export interface ISimulationStrategy {
    execute(args: SimulationArgs, algo: IGraphAlgorithmAdapter): Promise<any>;
}
