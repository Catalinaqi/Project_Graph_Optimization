// src/index.ts
import { Router, Request, Response, NextFunction } from "express";
import authRouter from "@/router/auth.router";
import userRouter from "@/router/user.router";
import modelsRouter from "@/router/models.router";
import logger from "@/config/logger";

const api: Router = Router();

/** ** Authentication Routes ** */
api.use("/auth", (req: Request, _res: Response, next: NextFunction) => {
    logger.info("[API Router] Incoming request to '/auth'", {
        method: req.method,
        url: req.originalUrl,
    });
    next();
}, authRouter);

/** ** User Routes ** */
api.use("/users", (req: Request, _res: Response, next: NextFunction) => {
    logger.info("[API Router] Incoming request to '/users'", {
        method: req.method,
        url: req.originalUrl,
    });
    next();
}, userRouter);

/** ** Models Routes ** */
api.use("/models", (req: Request, _res: Response, next: NextFunction) => {
    logger.info("[API Router] Incoming request to '/models'", {
        method: req.method,
        url: req.originalUrl,
    });
    next();
}, modelsRouter);

export default api;
