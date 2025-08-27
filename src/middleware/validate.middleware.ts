import type { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema, ValidationOptions } from "joi";
import { StatusCodes } from "http-status-codes";

export type ValidationErrorItem = {
  field: string;
  message: string;
  value: unknown;
  type: string;
};

type Target = "body" | "params" | "query" | "headers";

type ValidateConfig =
  | { schema: ObjectSchema; target: Target } // singolo target
  | { schema: Partial<Record<Target, ObjectSchema>>; target?: never }; // multi-target

type MiddlewareOpts = {
  joi?: ValidationOptions; // override/merge opzioni Joi
};

/**
 * validationMiddlewareV2
 * - Supporta singolo target (body/params/query/headers) o più target contemporaneamente.
 * - Permette override di opzioni Joi (convert, stripUnknown, abortEarly, ecc.).
 */
export function validationMiddlewareV2(
  config: ValidateConfig,
  opts?: MiddlewareOpts,
) {
  // default Joi options sensate per API
  const defaultJoi: ValidationOptions = {
    abortEarly: false,
    allowUnknown: false, // evitiamo injection in body/params/query
    stripUnknown: true, // rimuove chiavi non previste dallo schema
    convert: true, // coerce (es. "123" -> 123 in query)
  };

  const base = { ...defaultJoi, ...(opts?.joi || {}) };

  const validateOne = (schema: ObjectSchema, target: Target, req: Request) => {
    // Per headers ha senso consentire unknown (non vogliamo “mangiare” header standard)
    const jo =
      target === "headers"
        ? { ...base, allowUnknown: true, stripUnknown: false }
        : base;

    const { error, value } = schema.validate(req[target], jo);

    if (error) {
      const errors: ValidationErrorItem[] = error.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
        value: d.context?.value,
        type: d.type,
      }));

      return {
        ok: false as const,
        payload: {
          message: `Validation failed on "${target}"`,
          errors,
          target,
        },
      };
    }

    // Applichiamo i valori validati + default di Joi
    if (target === "query") {
      Object.assign(req.query, value);
    } else if (target === "headers") {
      // non sovrascrivere l’oggetto headers; se serve, esponi i valori normalizzati altrove
      (req as any)._validatedHeaders = value;
    } else {
      req[target] = value;
    }

    return { ok: true as const };
  };

  return (req: Request, res: Response, next: NextFunction) => {
    // 1) Config: singolo target?
    if ("target" in config && config.target) {
      const r = validateOne(config.schema as ObjectSchema, config.target, req);
      if (!r.ok) return res.status(StatusCodes.BAD_REQUEST).json(r.payload);
      return next();
    }

    // 2) Multi-target
    const schemas = config.schema as Partial<Record<Target, ObjectSchema>>;
    const order: Target[] = ["headers", "params", "query", "body"]; // validiamo in ordine “naturale”
    for (const t of order) {
      const s = schemas[t];
      if (!s) continue;
      const r = validateOne(s, t, req);
      if (!r.ok) return res.status(StatusCodes.BAD_REQUEST).json(r.payload);
    }

    return next();
  };
}
