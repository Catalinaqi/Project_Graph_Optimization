/*
import { Router } from "express";
import logger from "@/config/logger";
import { catchAsync } from "@/common/util/catchAsync";
import {authenticationMiddleware} from "@/middleware/authentication.middleware";
import {ensureBalanceForExecution, requirePositiveTokens} from "@/middleware/tokens.middleware";
import { validationMiddleware } from "@/middleware/validate.middleware";
import { GraphSchema, IdNumericParams } from "@/common/util/validation-schema";
import {ModelController} from "@/controller/ModelController";
*/
import { Router } from "express";
import ModelsController from "@/controller/ModelController";
import {authenticationMiddleware} from "@/middleware/authentication.middleware"; // tu JWT
import { validationMiddlewareV2 }  from "@/middleware/validate.middleware";
//import { createModelSchema, executeSchema } from "@/common/util/validation-schema";
import Joi from "joi";

const router = Router();

const graphSchema = Joi.object().pattern(
    Joi.string().min(1),
    Joi.object().pattern(Joi.string().min(1), Joi.number().positive())
);

const createModelSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().allow(null, "").max(500),
    graph: graphSchema.required(),
});

router.post(
    "/",
    authenticationMiddleware,
    validationMiddlewareV2({ schema: createModelSchema, target: "body" }),
    ModelsController.create
);

const executeBody = Joi.object({
    start: Joi.string().min(1).required(),
    goal: Joi.string().min(1).required(),
});

const executeParams = Joi.object({
    modelId: Joi.number().integer().positive().required(),
});

router.post(
    "/:modelId/execute",
    authenticationMiddleware,
    validationMiddlewareV2({ schema: { params: executeParams, body: executeBody } }),
    ModelsController.execute
);

const getOneParams = Joi.object({
    modelId: Joi.number().integer().positive().required(),
});

router.get(
    "/:modelId",
    authenticationMiddleware,
    validationMiddlewareV2({ schema: { params: getOneParams } }),
    ModelsController.getOne
);

export default router;