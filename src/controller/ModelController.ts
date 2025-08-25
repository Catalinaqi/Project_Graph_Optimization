import { Request, Response, NextFunction } from "express";
import * as ModelService from "@/service/ModelService";
import logger from "@/config/logger";

const ModelsController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const ownerUserId = req.user!.id; // injectado por tu auth middleware
            const { name, description, graph } = req.body;

            const data = await ModelService.createModelAndCharge({
                ownerUserId, name, description, graph,
            });

            return res.status(201).json({ success: true, data });
        } catch (e) { next(e); }
    },

    async execute(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const modelId = Number(req.params.modelId);
            const { start, goal } = req.body;

            if (!Number.isFinite(modelId) || modelId <= 0)
                return res.status(400).json({ success: false, error: "Invalid modelId" });

            const data = await ModelService.executeAndCharge({ modelId, start, goal, userId });
            return res.json({ success: true, data });
        } catch (e) { next(e); }
    },

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const modelId = Number(req.params.modelId);
            if (!Number.isFinite(modelId) || modelId <= 0)
                return res.status(400).json({ success: false, error: "Invalid modelId" });

            const data = await ModelService.getModelWithLatest(modelId);
            return res.json({ success: true, data });
        } catch (e) { next(e); }
    },
};

export default ModelsController;
