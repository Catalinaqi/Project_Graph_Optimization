import { ValidationError } from "@/common/types";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

/**
 * validation middleware
 * @param schema - Joi schema to validate against
 * @param target - Which part of the request to validate (default: 'body')
 */
export const validationMiddleware = (
    schema: Joi.ObjectSchema,
    target: "body" | "params" | "query" | "headers" = "body",
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req[target], {
            abortEarly: false,
            allowUnknown: false,
        });

        if (error) {
            const validationErrors: ValidationError[] = error.details.map(
                (detail) => ({
                    field: detail.path.join("."),
                    message: detail.message,
                    value: detail.context?.value,
                    type: detail.type,
                }),
            );

            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Validation failed",
                errors: validationErrors,
            });
        }

        // replace original data with validated/sanitized data
        if (target === "query") {
            Object.assign(req.query, value);
        } else {
            req[target] = value;
        }
        next();
    };
};
