import Graph  from "node-dijkstra";

export interface IGraphAlgorithm {
    execute(graph: any, start: string, goal: string): { path: string[]; cost: number } | null;
}

export class NodeDijkstraAdapter implements IGraphAlgorithm {
    execute(graph: any, start: string, goal: string) {
        const res: any = new Graph(graph).path(start, goal, { cost: true });
        return res ? { path: res.path, cost: res.cost } : null;
    }
}
