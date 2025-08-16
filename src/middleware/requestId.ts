import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestId(req: Request, _res: Response, next: NextFunction) {
    // genera un id por petición para trazar logs
    (req as any).reqId = req.headers["x-request-id"] ?? randomUUID();
    next();
}
