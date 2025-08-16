import { StatusCodes } from "http-status-codes";
import { ErrorEnum } from "@/common/enums";

/**
 * ⚠️ Classe ErrorObj
 *
 * Descrizione:
 * - Estende la classe `Error` nativa di JS per includere:
 *   🔹 `status`: codice HTTP da restituire
 *   🔹 `msg`: messaggio da mostrare al client
 *   🔹 `type`: tipo di errore (mappato in `ErrorEnum`)
 * - Consente di restituire un errore strutturato ai middleware di Express.
 *
 * Flusso:
 * 1. Quando si crea un `ErrorObj`, viene popolato con status, msg e type.
 * 2. Il metodo `toJSON()` permette di serializzare l’errore in una risposta JSON standardizzata.
 */
export class ErrorObj extends Error {
    status: number;
    msg: string;
    type: ErrorEnum;

    constructor(status: number, msg: string, type: ErrorEnum) {
        super(msg);                // <- importante
        this.name = type;
        this.status = status;
        this.msg = msg;
        this.type = type;
        Object.setPrototypeOf(this, new.target.prototype);
        if (Error.captureStackTrace) Error.captureStackTrace(this, ErrorObj);
    }

    // 🔄 Conversione in JSON per la risposta HTTP
    toJSON() {
        return { status: this.status, msg: this.msg };
    }
}

/**
 * 🗂️ Configurazione errori (ErrorEnum → status + messaggio)
 *
 * Descrizione:
 * - Associa ad ogni tipo di errore (`ErrorEnum`) un codice HTTP e un messaggio standard.
 * - Centralizza la definizione per evitare duplicazioni nei controller o nei middleware.
 * - Consente uniformità nelle risposte d’errore al client.
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

    // Errori specifici richiesti
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
    // Nuevos errores para JWT y servidor
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




};

/**
 * 🏭 Factory getError
 *
 * Descrizione:
 * - Riceve un `ErrorEnum` e costruisce un `ErrorObj` corrispondente.
 * - Se il tipo non è mappato, restituisce un errore generico (500).
 *
 * Flusso:
 * 1. Cerca la configurazione corrispondente in `errorConfig`.
 * 2. Crea e ritorna un nuovo `ErrorObj` con `status`, `msg` e `type`.
 * 3. Questo oggetto verrà poi intercettato dal middleware `errorHandler` e serializzato in JSON.
 */
export function getErrorFirts(type: ErrorEnum): ErrorObj {
    const config = errorConfig[type] ?? errorConfig[ErrorEnum.GENERIC_ERROR];
    return new ErrorObj(config.status, config.msg, type);
}

export function getError(type: ErrorEnum, overrideMsg?: string, overrideStatus?: number): ErrorObj {
    const cfg = errorConfig[type] ?? errorConfig[ErrorEnum.GENERIC_ERROR];
    return new ErrorObj(overrideStatus ?? cfg.status, overrideMsg ?? cfg.msg, type);
}
