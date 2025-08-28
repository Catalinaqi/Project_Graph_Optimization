import { Router } from "express";
import ModelsController from "@/controller/model.controller";
import { authenticationMiddleware } from "@/middleware/authentication.middleware";
import { validationMiddlewareV2 } from "@/middleware/validate.middleware";
import { SimulationController } from "@/controller/simulation.controller";
import Joi from "joi";
import {
  moderationBodyReject,
  simulateBody,
  simulateParams,
  versionsParams,
  versionsQuery,
  weightChangeCreateBody,
  weightChangeCreateParams,
  weightChangeListQuery,
  weightChangeModerationParams,
} from "@/common/util/validation-schema";
import WeightChangeController from "@/controller/weight-change.controller";

const router = Router();
const simulationController = new SimulationController();

const graphSchema = Joi.object().pattern(
  Joi.string().min(1),
  Joi.object().pattern(Joi.string().min(1), Joi.number().positive()),
);

const createModelSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow(null, "").max(500),
  graph: graphSchema.required(),
});

/**
 * Models: creation
 *
 *  * Description:
 *  * This endpoint allows an authenticated user to create a new model.
 *  * The request body must include the model name, an optional description,
 *  * and a graph structure represented as an adjacency list.
 *  * The graph is validated to ensure it is a proper adjacency list with non-empty string keys
 *  * and positive number values.
 *
 *  * Objective:
 *  * Validate the input data, create a new model in the database,
 *  * and return the created model's details.
 *
 *  * Parameters:
 *  @param req.user {object} - Populated by the authentication middleware with user payload.
 *  @param req.body.name {string} - The name of the model to create.
 *  @param req.body.description {string} - An optional description of the model.
 *  @param req.body.graph {object} - The graph structure as an adjacency list.
 *
 *  * Returns:
 *  JSON containing the created model's information, including its ID and creation timestamp.
 */
router.post(
  "/",
  authenticationMiddleware,
  validationMiddlewareV2({ schema: createModelSchema, target: "body" }),
  ModelsController.create,
);

const executeBody = Joi.object({
  start: Joi.string().min(1).required(),
  goal: Joi.string().min(1).required(),
});

const executeParams = Joi.object({
  modelId: Joi.number().integer().positive().required(),
});

/** Models: execute */
router.post(
  "/:modelId/execute",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: { params: executeParams, body: executeBody },
  }),
  ModelsController.execute,
);

const getOneParams = Joi.object({
  modelId: Joi.number().integer().positive().required(),
});

/** Models: consult for id model */
router.get(
  "/:modelId",
  authenticationMiddleware,
  validationMiddlewareV2({ schema: { params: getOneParams } }),
  ModelsController.getOne,
);

/**
 * Weight change: create
 * *
 * * Description:
 * * This endpoint allows an authenticated user to request a weight change for a specific model.
 * * The request must include the model ID as a URL parameter and the new weights in the request body.
 * * The new weights are validated to ensure they are in the correct format.
 *
 * * Objective:
 * * Validate the input data, create a weight change request in the database,
 * * and return the details of the created request.
 *
 * * Parameters:
 * @param req.user {object} - Populated by the authentication middleware with user payload.
 * @param req.params.id {number} - The ID of the model for which the weight change is requested.
 * @param req.body.newWeights {object} - The new weights as an adjacency list.
 *
 * * Returns:
 * JSON containing the created weight change request's information, including its ID and status.
 */
router.post(
  "/:id/weight-change",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: { params: weightChangeCreateParams, body: weightChangeCreateBody },
  }),
  WeightChangeController.create,
);

/** Weight change: list with filters*/
router.get(
  "/:id/weight-change",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: { params: weightChangeCreateParams, query: weightChangeListQuery },
  }),
  WeightChangeController.list,
);

/** Approve */
router.patch(
  "/:id/weight-change/:requestId/approve",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: weightChangeModerationParams,
    target: "params",
  }),
  WeightChangeController.approve,
);

/** Reject */
router.patch(
  "/:id/weight-change/:requestId/reject",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: {
      params: weightChangeModerationParams,
      body: moderationBodyReject,
    },
  }),
  WeightChangeController.reject,
);

/** Versions list */
router.get(
  "/:id/versions",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: { params: versionsParams, query: versionsQuery },
  }),
  WeightChangeController.listVersions,
);

/**
 * Simulation: simulate
 *
 * * Description:
 * * This endpoint allows an authenticated user to simulate a pathfinding operation on a specific model.
 * * The request must include the model ID as a URL parameter and the simulation parameters in the request body.
 * * The simulation parameters are validated to ensure they are in the correct format.
 *
 * * Objective:
 * * Validate the input data, perform the simulation without charging the user,
 * * and return the simulation results.
 *
 * * Parameters:
 * @param req.user {object} - Populated by the authentication middleware with user payload.
 * @param req.params.id {number} - The ID of the model to simulate.
 * @param req.body.from {string} - The starting node for the simulation.
 * @param req.body.to {string} - The ending node for the simulation.
 * @param req.body.start {number} - The starting value for the simulation parameter.
 * @param req.body.stop {number} - The stopping value for the simulation parameter.
 * @param req.body.step {number} - The step value for the simulation parameter.
 * @param req.body.origin {string} - The origin point for the simulation.
 * @param req.body.goal {string} - The goal point for the simulation.
 * * Returns:
 * JSON containing the results of the simulation, including the path taken and any relevant metrics.
 */
router.post(
  "/:id/simulate",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: { params: simulateParams, body: simulateBody },
  }),
  simulationController.simulate.bind(simulationController),
);

export default router;
