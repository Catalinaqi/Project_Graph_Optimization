import { Request, Response, NextFunction } from "express";
import { ModelService } from "@/service/model.service";

/**
 * ModelController
 * * Description:
 * * Controller responsible for handling HTTP requests related to models.
 * * Exposes methods for creating models and executing them.
 * * Delegates the actual business logic to `ModelService` and ensures proper HTTP responses.
 */
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

  /**
   * POST /models/:modelId/execute
   * * Description:
   * * Executes a model from a start point to a goal point and charges the user.
   * * Objective:
   * * - Extract `start` and `goal` from the request body.
   * * - Extract `modelId` from the request parameters.
   * * - Extract `userId` from the authenticated user in the request.
   * * - Call `ModelService.executeAndCharge` to perform the execution and handle billing.
   * * - Return a JSON response with the execution result.
   */
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

  /**
   * GET /models/:modelId
   * * Description:
   * * Retrieves a model by its ID along with its latest version.
   * * Objective:
   * * - Extract `modelId` from the request parameters.
   * * - Call `ModelService.getModelWithLatest` to fetch the model and its latest version.
   * * - Return a JSON response with the model data.
   */
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
