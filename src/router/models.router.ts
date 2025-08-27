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

/** Models: creation */
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

/** Weight change: creation */
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

/** Simulation */
router.post(
  "/:id/simulate",
  authenticationMiddleware,
  validationMiddlewareV2({
    schema: { params: simulateParams, body: simulateBody },
  }),
  simulationController.simulate.bind(simulationController),
);

export default router;
