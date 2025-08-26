// src/service/simulation/SimulationStrategy.ts
import { IGraphAlgorithmAdapter } from "./GraphAdapter";

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
