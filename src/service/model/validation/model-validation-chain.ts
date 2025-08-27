import { Request } from "express";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";

export abstract class ValidationHandler {
    private next: ValidationHandler | null = null;

    setNext(handler: ValidationHandler) {
        this.next = handler;
        return handler;
    }

    async handle(req: Request) {
        await this.check(req);
        if (this.next) await this.next.handle(req);
    }

    protected abstract check(req: Request): Promise<void>;
}

export class PositiveTokensHandler extends ValidationHandler {
    protected async check(req: Request) {
        const tokens = req.user?.token ?? 0;
        if (tokens <= 0) {
            throw getError(ErrorEnum.UNAUTHORIZED_ERROR, "Tokens depleted", 401);
        }
    }
}
