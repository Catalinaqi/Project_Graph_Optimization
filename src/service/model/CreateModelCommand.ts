export class CreateModelCommand {
    constructor(private action: () => Promise<any>) {}

    async execute() {
        return this.action();
    }
}
