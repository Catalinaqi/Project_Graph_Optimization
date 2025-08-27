import { Request, Response, NextFunction } from "express";
import { ModelService } from "@/service/model.service";

const ModelController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, graph } = req.body;
      const ownerUserId = req.user!.id;

      const data = await ModelService.createModelAndCharge({
        ownerUserId,
        name,
        description,
        graph,
      });

      return res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async execute(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, goal } = req.body;
      const userId = req.user!.id;
      const modelId = Number(req.params.modelId);

      const data = await ModelService.executeAndCharge({
        modelId,
        start,
        goal,
        userId,
      });
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const modelId = Number(req.params.modelId);
      const data = await ModelService.getModelWithLatest(modelId);
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};

export default ModelController;
