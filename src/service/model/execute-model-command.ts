export class ExecuteModelCommand {
  constructor(private action: () => Promise<any>) {}

  async execute() {
    return this.action();
  }
}
