import { StatusCodes } from "http-status-codes";
import { ErrorEnum } from "@/common/enums";

/**
 * ErrorObj
 *
 * Description:
 * Extends the native JavaScript `Error` class to include:
 * - `status`: HTTP status code to return to the client.
 * - `msg`: Message to show to the client.
 * - `type`: Error type mapped from `ErrorEnum`.
 *
 * Objective:
 * Provide a structured error object that can be passed through
 * Express middleware and returned as a consistent JSON response.
 */
export class ErrorObj extends Error {
  status: number;
  msg: string;
  type: ErrorEnum;

  constructor(status: number, msg: string, type: ErrorEnum) {
    super(msg);
    this.name = type;
    this.status = status;
    this.msg = msg;
    this.type = type;
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorObj);
    }
  }

  /**
   * toJSON
   *
   * Description:
   * Converts the error object into a JSON-friendly format.
   *
   * Returns:
   * @returns {Object} - An object containing status and msg fields.
   */
  toJSON() {
    return { status: this.status, msg: this.msg };
  }
}

/**
 * errorConfig
 *
 * Description:
 * Maps each `ErrorEnum` type to an HTTP status code and a default message.
 *
 * Objective:
 * - Centralize error definitions to avoid duplication.
 * - Ensure consistent error responses across the application.
 *
 * Returns:
 * @returns {Record<ErrorEnum, { status: number; msg: string }>}
 */
export const errorConfig: Record<ErrorEnum, { status: number; msg: string }> = {
  [ErrorEnum.GENERIC_ERROR]: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    msg: "An unexpected error occurred. Please try again later.",
  },
  [ErrorEnum.NOT_FOUND_ERROR]: {
    status: StatusCodes.NOT_FOUND,
    msg: "Resource not found.",
  },
  [ErrorEnum.NOT_FOUND_ROUTE_ERROR]: {
    status: StatusCodes.NOT_FOUND,
    msg: "Route not found.",
  },
  [ErrorEnum.FORBIDDEN_ERROR]: {
    status: StatusCodes.FORBIDDEN,
    msg: "Forbidden access.",
  },
  [ErrorEnum.UNAUTHORIZED_ERROR]: {
    status: StatusCodes.UNAUTHORIZED,
    msg: "Unauthorized access.",
  },
  [ErrorEnum.BAD_REQUEST_ERROR]: {
    status: StatusCodes.BAD_REQUEST,
    msg: "Bad request.",
  },
  [ErrorEnum.CONFLICT_ERROR]: {
    status: StatusCodes.CONFLICT,
    msg: "Conflict detected.",
  },
  [ErrorEnum.INVALID_JWT_FORMAT]: {
    status: StatusCodes.BAD_REQUEST,
    msg: "Invalid JWT format.",
  },
  [ErrorEnum.EMAIL_ALREADY_REGISTERED_OR_INVALID]: {
    status: StatusCodes.BAD_REQUEST,
    msg: "Email already registered or invalid data.",
  },
  [ErrorEnum.VALIDATION_FAILED]: {
    status: StatusCodes.UNPROCESSABLE_ENTITY,
    msg: "Validation failed.",
  },
  [ErrorEnum.INVALID_CREDENTIALS]: {
    status: StatusCodes.UNAUTHORIZED,
    msg: "Invalid email or password.",
  },
  [ErrorEnum.NO_AUTHORIZED]: {
    status: StatusCodes.UNAUTHORIZED,
    msg: "Unauthorized.",
  },
  [ErrorEnum.INSUFFICIENT_PERMISSIONS]: {
    status: StatusCodes.FORBIDDEN,
    msg: "Insufficient permissions.",
  },
  [ErrorEnum.USER_NOT_FOUND]: {
    status: StatusCodes.NOT_FOUND,
    msg: "User not found.",
  },
  [ErrorEnum.SERVER_ERROR]: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    msg: "Internal server error.",
  },
  [ErrorEnum.INVALID_JWT_SIGNATURE]: {
    status: StatusCodes.UNAUTHORIZED,
    msg: "Invalid JWT signature.",
  },
  [ErrorEnum.JWT_EXPIRED]: {
    status: StatusCodes.UNAUTHORIZED,
    msg: "JWT has expired.",
  },
  [ErrorEnum.JWT_NOT_ACTIVE]: {
    status: StatusCodes.UNAUTHORIZED,
    msg: "JWT not active yet (nbf).",
  },
  [ErrorEnum.MISSING_AUTH_HEADER]: {
    status: StatusCodes.UNAUTHORIZED,
    msg: "Missing Authorization header.",
  },
  [ErrorEnum.BEARER_TOKEN_MALFORMED]: {
    status: StatusCodes.BAD_REQUEST,
    msg: "Malformed Bearer token.",
  },
  [ErrorEnum.DB_ERROR]: {
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    msg: "Database error.",
  },
};

/**
 * getError
 *
 * Description:
 * Factory method that returns an `ErrorObj` for a given error type.
 * Allows overriding of default message and status code.
 *
 * Parameters:
 * @param type {ErrorEnum} - The error type.
 * @param overrideMsg {string} - Optional message to replace the default.
 * @param overrideStatus {number} - Optional status code to replace the default.
 *
 * Returns:
 * @returns {ErrorObj} - An instance of ErrorObj.
 */
export function getError(
  type: ErrorEnum,
  overrideMsg?: string,
  overrideStatus?: number,
): ErrorObj {
  const cfg = errorConfig[type] ?? errorConfig[ErrorEnum.GENERIC_ERROR];
  return new ErrorObj(
    overrideStatus ?? cfg.status,
    overrideMsg ?? cfg.msg,
    type,
  );
}
