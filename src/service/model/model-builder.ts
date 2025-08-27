export class ModelBuilder {
  private graph: Record<string, Record<string, number>>;

  constructor(graph: any) {
    this.graph = graph as Record<string, Record<string, number>>;
  }

  build() {
    const nodes = Object.keys(this.graph || {}).length;
    const edges = Object.values(this.graph || {}).reduce(
      (a, o) => a + Object.keys(o).length,
      0,
    );
    const cost = Number((0.2 * nodes + 0.01 * edges).toFixed(2));
    return { graph: this.graph, nodes, edges, cost };
  }
}
