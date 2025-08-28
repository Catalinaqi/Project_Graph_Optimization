import Joi from "joi";

export const IdNumericParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});
export const IdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const UserSchema = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  recharge: Joi.object({
    email: Joi.string().email().required(),
    newBalance: Joi.alternatives()
      .try(Joi.number().min(0), Joi.string().pattern(/^\d+(\.\d+)?$/))
      .required()
      .messages({
        "alternatives.match": "newBalance must be a valid number >= 0",
      }),
    reason: Joi.string().max(200).optional(),
  }),
};

const GraphWeightsSchema = Joi.object()
  .pattern(
    Joi.string().min(1), // nodo
    Joi.object().pattern(
      Joi.string().min(1), // vecino
      Joi.number().greater(0).precision(6).required(), // peso > 0
    ),
  )
  .required()

  .custom((value, helpers) => {
    const nodes = Object.keys(value).length;
    const edges = Object.values(value).reduce(
      (a: number, o: any) => a + Object.keys(o).length,
      0,
    );
    if (nodes === 0 || edges === 0) {
      return helpers.error("any.custom", {
        message: "graph must have at least 1 node and 1 edge",
      });
    }
    return value;
  }, "graph size validation")
  .messages({ "any.custom": "{{#message}}" });

/** Grafo: { "A": { "B": 1.2, "C": 5 }, "B": { "A": 1.2 } } */
export const graphSchema = Joi.object()
  .pattern(
    Joi.string().min(1),
    Joi.object().pattern(Joi.string().min(1), Joi.number().positive()),
  )
  .required();

export const createModelSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow(null, "").max(500),
  graph: graphSchema,
});

export const executeSchema = Joi.object({
  start: Joi.string().min(1).required(),
  goal: Joi.string().min(1).required(),
});

export const GraphSchema = {
  // POST /api/models
  create: Joi.object({
    name: Joi.string().min(3).max(80).required(),
    description: Joi.string().max(10000).allow("").optional(),
    graph: GraphWeightsSchema,
  }),

  // GET /api/models/:id/execute?start=&goal=
  executeQuery: Joi.object({
    start: Joi.string().min(1).required(),
    goal: Joi.string().min(1).required(),
  }),

  requestsFilter: Joi.object({
    modelId: Joi.number().integer().positive().optional(),
    status: Joi.string().valid("pending", "approved", "rejected").optional(),
    sentFrom: Joi.date().iso().optional(),
    sentTo: Joi.date().iso().optional(),
  }),

  versionsFilter: Joi.object({
    modifiedFrom: Joi.date().iso().optional(),
    modifiedTo: Joi.date().iso().optional(),
    nodes: Joi.number().integer().min(1).optional(),
    edges: Joi.number().integer().min(1).optional(),
  }),

  changeWeight: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    newWeight: Joi.number().positive().precision(6).required(),
  }),

  simulate: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
    start: Joi.number().positive().required(),
    stop: Joi.number().positive().greater(Joi.ref("start")).required(),
    step: Joi.number().positive().less(Joi.ref("stop")).required(),
  }),
};

export const weightChangeCreateParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const weightChangeCreateBody = Joi.object({
  from: Joi.string().min(1).required(),
  to: Joi.string().min(1).required(),
  weight: Joi.number().positive().required(),
});

export const weightChangeListQuery = Joi.object({
  state: Joi.string().valid("pending", "approved", "rejected").optional(),
  fromDate: Joi.date().iso().optional(),
  toDate: Joi.date().iso().optional(),
});

export const weightChangeModerationParams = Joi.object({
  id: Joi.number().integer().positive().required(),
  requestId: Joi.number().integer().positive().required(),
});

export const moderationBodyReject = Joi.object({
  reason: Joi.string().min(3).max(500).required(),
});

export const versionsParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const versionsQuery = Joi.object({
  fromDate: Joi.date().iso().optional(),
  toDate: Joi.date().iso().optional(),
  nodeCount: Joi.number().integer().min(0).optional(),
  edgeCount: Joi.number().integer().min(0).optional(),
});

export const simulateParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const simulateBody = Joi.object({
  from: Joi.string().min(1).required(),
  to: Joi.string().min(1).required(),
  start: Joi.number().positive().required(),
  stop: Joi.number().positive().greater(Joi.ref("start")).required(),
  step: Joi.number().positive().max(Joi.ref("stop")).required(),
  goal: Joi.string().min(1).required(),
  origin: Joi.string().min(1).required(),
});
