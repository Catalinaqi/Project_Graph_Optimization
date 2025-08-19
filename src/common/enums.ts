/**
 * Enum: GraphRoleUserEnum
 *
 * Description:
 * Defines the available user roles in the system.
 * Roles determine the level of access and the operations that a user can perform.
 *
 * Values:
 * - `USER`  → Standard user, can create models and submit weight change requests.
 * - `ADMIN` → Administrator, can recharge tokens and approve/revoke requests.
 */
export enum GraphRoleUserEnum {
    USER = "user",
    ADMIN = "admin",
}

/**
 * Enum: GraphRequestStatusEnum
 *
 * Description:
 * Represents the different states of a weight change request on a graph.
 * Used to track the lifecycle of a request from submission to resolution.
 *
 * Values:
 * - `PENDING`  → Request has been submitted and is waiting for owner’s approval.
 * - `APPROVED` → Request has been approved, and the weight update will be applied.
 * - `REJECTED` → Request has been rejected (optional: rejection reason can be provided).
 */
export enum GraphRequestStatusEnum {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

/**
 * Enum: ErrorEnum
 *
 * Description:
 * Centralized list of error codes handled by the application.
 * Provides consistency across error handling in authentication, JWT, and server responses.
 *
 * Values:
 * - Generic Errors:
 *   - `GENERIC_ERROR` → Unspecified error.
 *   - `NOT_FOUND_ERROR` → Resource not found.
 *   - `NOT_FOUND_ROUTE_ERROR` → API route not found.
 *   - `FORBIDDEN_ERROR` → Access denied.
 *   - `UNAUTHORIZED_ERROR` → Authentication required or failed.
 *   - `BAD_REQUEST_ERROR` → Invalid request format or parameters.
 *   - `CONFLICT_ERROR` → Conflict with existing resource.
 *   - `INVALID_JWT_FORMAT` → Invalid JWT format.
 *
 * - User/Authentication Errors:
 *   - `EMAIL_ALREADY_REGISTERED_OR_INVALID` → Email already exists or invalid format (400).
 *   - `VALIDATION_FAILED` → Data validation error (422).
 *   - `INVALID_CREDENTIALS` → Wrong email/password (401).
 *   - `NO_AUTHORIZED` → User is not authorized (401).
 *   - `INSUFFICIENT_PERMISSIONS` → User does not have required permissions (403).
 *   - `USER_NOT_FOUND` → User does not exist (404).
 *
 * - JWT / Server Errors:
 *   - `SERVER_ERROR` → Internal server error (500).
 *   - `INVALID_JWT_SIGNATURE` → JWT signature verification failed (401).
 *   - `JWT_EXPIRED` → JWT has expired (401).
 *   - `JWT_NOT_ACTIVE` → JWT is not yet valid (nbf claim) (401).
 *   - `MISSING_AUTH_HEADER` → Missing `Authorization` header (401).
 *   - `BEARER_TOKEN_MALFORMED` → Malformed Bearer token (400).
 */
export enum ErrorEnum {
    // Generic Errors
    GENERIC_ERROR = "GENERIC_ERROR",
    NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
    NOT_FOUND_ROUTE_ERROR = "NOT_FOUND_ROUTE_ERROR",
    FORBIDDEN_ERROR = "FORBIDDEN_ERROR",
    UNAUTHORIZED_ERROR = "UNAUTHORIZED_ERROR",
    BAD_REQUEST_ERROR = "BAD_REQUEST_ERROR",
    CONFLICT_ERROR = "CONFLICT_ERROR",
    INVALID_JWT_FORMAT = "INVALID_JWT_FORMAT",

    // User/Authentication Errors
    EMAIL_ALREADY_REGISTERED_OR_INVALID = "EMAIL_ALREADY_REGISTERED_OR_INVALID",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    NO_AUTHORIZED = "NO_AUTHORIZED",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    USER_NOT_FOUND = "USER_NOT_FOUND",

    // JWT / Server Errors
    SERVER_ERROR = "SERVER_ERROR",
    INVALID_JWT_SIGNATURE = "INVALID_JWT_SIGNATURE",
    JWT_EXPIRED = "JWT_EXPIRED",
    JWT_NOT_ACTIVE = "JWT_NOT_ACTIVE",
    MISSING_AUTH_HEADER = "MISSING_AUTH_HEADER",
    BEARER_TOKEN_MALFORMED = "BEARER_TOKEN_MALFORMED",
}
