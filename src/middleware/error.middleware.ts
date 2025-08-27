// src/middleware/error.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "@/config/logger";
import enviroment from "@/config/enviroment";
import { ErrorObj, getError } from "@/common/util/api-error";
import { ErrorEnum } from "@/common/enums";

/**
 * notFoundHandler (404)
 *
 * Description:
 * Terminal middleware for handling unknown routes. Executed when no
 * previous router has matched the request. Returns a standardized
 * JSON response with metadata useful for debugging.
 *
 * Parameters:
 * @param req {Request} - The incoming request object.
 * @param res {Response} - The response object used to send the result.
 *
 * Returns:
 * @returns {void} - Sends a 404 JSON response.
 */
export function notFoundHandler(req: Request, res: Response): void {
    const errObj =
        getError(ErrorEnum.NOT_FOUND_ROUTE_ERROR) ??
        new ErrorObj(
            StatusCodes.NOT_FOUND,
            "Route not found.",
            ErrorEnum.NOT_FOUND_ROUTE_ERROR
        );

    const { status, msg } = errObj.toJSON();

    logger.warn({
        message: "[NotFoundHandler] Route not found",
        meta: {
            method: req.method,
            path: req.originalUrl,
            status,
            msg,
        },
    });

    res.status(status).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found: ${msg}`,
        method: req.method,
        path: req.originalUrl,
        timestamp: new Date().toLocaleString(),
    });
}

/**
 * errorConverter
 *
 * Description:
 * Converts arbitrary errors into a uniform `ErrorObj` format.
 * - If the error is already an `ErrorObj`, it is passed along unchanged.
 * - If it is a generic `Error`, it is wrapped into an `ErrorObj` with status 500.
 * - Otherwise, a generic error object is created.
 *
 * Parameters:
 * @param err {unknown} - The error to be converted.
 * @param _req {Request} - The incoming request (unused).
 * @param _res {Response} - The response object (unused).
 * @param next {NextFunction} - Calls the next middleware with a normalized error.
 *
 * Returns:
 * @returns {void}
 */
export function errorConverter(
    err: unknown,
    _req: Request,
    _res: Response,
    next: NextFunction
): void {
    if (err instanceof ErrorObj) {
        return next(err);
    }
    if (err instanceof Error) {
        return next(
            new ErrorObj(
                StatusCodes.INTERNAL_SERVER_ERROR,
                err.message || "Unexpected error",
                ErrorEnum.GENERIC_ERROR
            )
        );
    }
    return next(getError(ErrorEnum.GENERIC_ERROR));
}

/**
 * errorHandler
 *
 * Description:
 * Global error handler middleware. Logs error details and returns
 * a standardized JSON response. Includes stack trace only in non-production environments.
 *
 * Important:
 * This middleware must not call `next()` after sending the response.
 *
 * Parameters:
 * @param err {ErrorObj | Error} - The error to be handled.
 * @param req {Request} - The incoming request object.
 * @param res {Response} - The response object used to send the result.
 * @param _next {NextFunction} - The next middleware (unused).
 *
 * Returns:
 * @returns {Response} - Sends a JSON error response with metadata.
 */
export function errorHandler(
    err: ErrorObj | Error,
    req: Request,
    res: Response,
    _next: NextFunction
): Response {
    const normalized =
        err instanceof ErrorObj
            ? err
            : new ErrorObj(
                StatusCodes.INTERNAL_SERVER_ERROR,
                (err as Error)?.message || "Unexpected error",
                ErrorEnum.GENERIC_ERROR
            );

    const { status, msg } = normalized.toJSON();
    const code = (normalized as any)?.type ?? ErrorEnum.GENERIC_ERROR;

    logger.error({
        message: "[ErrorHandler] Exception intercepted",
        meta: {
            code,
            status,
            msg,
            method: req.method,
            path: req.originalUrl,
            ...(enviroment.nodeEnv !== "production" && {
                stack: (normalized as Error).stack,
            }),
            rid: (req as any).rid, // request id if managed upstream
        },
    });

    return res.status(status).json({
        success: false,
        error: msg,
        code,
        method: req.method,
        path: req.originalUrl,
        timestamp: new Date().toLocaleString(), //toISOString
        ...(enviroment.nodeEnv !== "production" && {
            stack: (normalized as Error).stack,
        }),
    });
}
