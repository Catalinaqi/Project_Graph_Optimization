import Graph from "node-dijkstra";

export interface IGraphAlgorithmAdapter {
  findPath(
    graph: any,
    from: string,
    to: string,
  ): { path: string[]; cost: number } | null;
}

export class NodeDijkstraAdapter implements IGraphAlgorithmAdapter {
  findPath(graph: any, from: string, to: string) {
    const route = new Graph(graph).path(from, to, { cost: true });
    if (!route) return null;

    if (Array.isArray(route)) {
      return { path: route, cost: 0 };
    }

    return { path: route.path, cost: route.cost };
  }
}
