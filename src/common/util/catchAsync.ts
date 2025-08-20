import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * This utils function helps to catch async errors in express routes
 * @param fn The function to be wrapped
 * @returns A function that wraps the original function and catches any errors
 *
 *
 *
 *  Wrappe un handler async y pasa cualquier error a next() (Express error handler).
 *  Evita try/catch repetidos en todos los controllers.
 *
 *
 */
export function catchAsync(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
