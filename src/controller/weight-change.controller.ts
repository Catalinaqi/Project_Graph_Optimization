import { Request, Response, NextFunction } from "express";
import * as Svc from "@/service/weight-change.service";
import ModelDao from "@/dao/model.dao";
import { getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";

/**
 * Asserts that the user is the owner of the model.
 * * @param modelId The ID of the model to check.
 * * @param userId The ID of the user to check.
 * * @throws Will throw an error if the model does not exist or if the user is not the owner.
 * * @returns void
 * * Objective:
 * * - Fetch the model by its primary key using `ModelDao.findModelByPk`.
 * * - If the model does not exist, throw a 404 Not Found error.
 * * - If the user is not the owner of the model, throw a 401 Unauthorized error.
 * * - If the user is the owner, simply return without error.
 * * Note: This function is used to ensure that only the owner of a model can approve or reject weight change requests.
 */
async function assertOwner(modelId: number, userId: number) {
  const model = await ModelDao.findModelByPk(modelId);
  if (!model) throw getError(ErrorEnum.NOT_FOUND_ERROR, "Model not found", 404);
  if (model.id_owner_user !== userId)
    throw getError(ErrorEnum.UNAUTHORIZED_ERROR, "Not model owner", 401);
}

const WeightChangeController = {
  /**
   * POST /models/:id/weight-changes
   * * Description:
   * * Creates a weight change request for a specific model.
   * * Objective:
   * * - Extract `from`, `to`, and `weight` from the request body.
   * * - Extract `id` (modelId) from the request parameters.
   * * - Extract `requesterUserId` from the authenticated user in the request.
   * * - Call `Svc.requestWeightChange` to create the weight change request.
   * * - Return a 201 Created response with the created request data.
   * * @param req Express Request object. Expects `from`, `to`, and `weight` in `req.body` and `id` in `req.params`.
   * * @param res Express Response object used to send back JSON response.
   * * @param next Express NextFunction used for error propagation.
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const modelId = Number(req.params.id);
      const { from, to, weight } = req.body;
      const requesterUserId = req.user!.id;
      const data = await Svc.requestWeightChange({
        modelId,
        from,
        to,
        weight,
        requesterUserId,
      });
      return res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  /**
   * GET /models/:id/weight-changes
   * * Description:
   * * Lists weight change requests for a specific model, with optional filtering.
   * * Objective:
   * * - Extract `id` (modelId) from the request parameters.
   * * - Extract optional query parameters: `state`, `fromDate`, and `toDate`.
   * * - Call `Svc.listWeightChanges` to retrieve the list of weight change requests.
   * * - Return a JSON response with the list of requests.
   * * @param req Express Request object. Expects `id` in `req.params` and optional query parameters in `req.query`.
   * * @param res Express Response object used to send back JSON response.
   * * @param next Express NextFunction used for error propagation.
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const modelId = Number(req.params.id);
      const { state, fromDate, toDate } = req.query as any;
      const data = await Svc.listWeightChanges(modelId, {
        status: state,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      });
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  /**
   * POST /models/:id/weight-changes/:requestId/approve
   * * Description:
   * * Approves a weight change request for a specific model.
   * * Objective:
   * * - Extract `id` (modelId) and `requestId` from the request parameters.
   * * - Extract `approverUserId` from the authenticated user in the request.
   * * - Call `assertOwner` to ensure the user is the owner of the model.
   * * - Call `Svc.approveRequest` to approve the weight change request.
   * * - Return a JSON response with the approved request data.
   * * * @param req Express Request object. Expects `id` and `requestId` in `req.params`.
   * * * @param res Express Response object used to send back JSON response.
   * * * @param next Express NextFunction used for error propagation.
   */
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const modelId = Number(req.params.id);
      const requestId = Number(req.params.requestId);
      const approverUserId = req.user!.id;
      await assertOwner(modelId, approverUserId);
      const data = await Svc.approveRequest({
        modelId,
        requestId,
        approverUserId,
      });
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  /**
   * POST /models/:id/weight-changes/:requestId/reject
   * * Description:
   * * Rejects a weight change request for a specific model.
   * * Objective:
   * * - Extract `id` (modelId) and `requestId` from the request parameters.
   * * - Extract `reason` from the request body.
   * * - Extract `approverUserId` from the authenticated user in the request.
   * * - Call `assertOwner` to ensure the user is the owner of the model.
   * * - Call `Svc.rejectRequest` to reject the weight change request.
   * * - Return a JSON response with the rejected request data.
   * * * @param req Express Request object. Expects `id` and `requestId` in `req.params` and `reason` in `req.body`.
   * * * @param res Express Response object used to send back JSON response.
   * * * @param next Express NextFunction used for error propagation.
   */
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const modelId = Number(req.params.id);
      const requestId = Number(req.params.requestId);
      const { reason } = req.body;
      const approverUserId = req.user!.id;
      await assertOwner(modelId, approverUserId);
      const data = await Svc.rejectRequest({
        modelId,
        requestId,
        reason,
        approverUserId,
      });
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  /**
   * GET /models/:id/weight-changes/versions
   * * Description:
   * * Lists versions of weight changes for a specific model, with optional filtering.
   * * Objective:
   * * - Extract `id` (modelId) from the request parameters.
   * * - Extract optional query parameters: `fromDate`, `toDate`, `nodeCount`, and `edgeCount`.
   * * - Call `Svc.listVersions` to retrieve the list of weight change versions.
   * * - Return a JSON response with the list of versions.
   * * * @param req Express Request object. Expects `id` in `req.params` and optional query parameters in `req.query`.
   * * * * @param res Express Response object used to send back JSON response.
   * * * @param next Express NextFunction used for error propagation.
   */
  async listVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const modelId = Number(req.params.id);
      const { fromDate, toDate, nodeCount, edgeCount } = req.query as any;
      const data = await Svc.listVersions(modelId, {
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
        nodeCount: nodeCount != null ? Number(nodeCount) : undefined,
        edgeCount: edgeCount != null ? Number(edgeCount) : undefined,
      });
      return res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};

export default WeightChangeController;
