// 🎭 Ruoli disponibili per gli utenti nel sistema
export enum GraphRoleUserEnum {
    USER = "user",   // Utente standard → può creare modelli, fare richieste di cambio peso
    ADMIN = "admin", // Amministratore → può ricaricare token, approvare/revocare richieste
}

// 📌 Stati delle richieste di cambio peso su un grafo
export enum GraphRequestStatusEnum {
    PENDING = "pending",   // Richiesta inviata, in attesa di approvazione dal proprietario
    APPROVED = "approved", // Richiesta accettata → viene applicato l’aggiornamento peso
    REJECTED = "rejected", // Richiesta rifiutata → opzionale motivazione del rifiuto
}

// ⚠️ Tipologie di errori gestiti dall'applicazione
export enum ErrorEnum {
    // Errori generici
    GENERIC_ERROR = "GENERIC_ERROR",
    NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
    NOT_FOUND_ROUTE_ERROR = "NOT_FOUND_ROUTE_ERROR",
    FORBIDDEN_ERROR = "FORBIDDEN_ERROR",
    UNAUTHORIZED_ERROR = "UNAUTHORIZED_ERROR",
    BAD_REQUEST_ERROR = "BAD_REQUEST_ERROR",
    CONFLICT_ERROR = "CONFLICT_ERROR",
    INVALID_JWT_FORMAT = "INVALID_JWT_FORMAT",

    // Errori specifici utente/autenticazione
    EMAIL_ALREADY_REGISTERED_OR_INVALID = "EMAIL_ALREADY_REGISTERED_OR_INVALID", // 400
    VALIDATION_FAILED = "VALIDATION_FAILED", // 422
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS", // 401
    NO_AUTHORIZED = "NO_AUTHORIZED", // 401
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS", // 403
    USER_NOT_FOUND = "USER_NOT_FOUND", // 404

    // ✅ nuevos para JWT y server
    SERVER_ERROR = "SERVER_ERROR",              // 500
    INVALID_JWT_SIGNATURE = "INVALID_JWT_SIGNATURE", // 401
    JWT_EXPIRED = "JWT_EXPIRED",                // 401
    JWT_NOT_ACTIVE = "JWT_NOT_ACTIVE",          // 401 (nbf)
    MISSING_AUTH_HEADER = "MISSING_AUTH_HEADER",// 401 (no Authorization)
    BEARER_TOKEN_MALFORMED = "BEARER_TOKEN_MALFORMED", // 400

}
