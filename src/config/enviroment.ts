import { Enviroment } from "@/common/types";
import dotenv from "dotenv";
import logger from "@/config/logger";
import * as process from "process";

/**
 * Environment Configuration
 *
 * Description:
 * Loads and exposes typed application configuration derived from `.env`
 * and safe defaults. Centralizes access to environment variables to avoid
 * scattering `process.env` usage across the codebase.
 *
 * Objective:
 * - Provide a single, typed source of truth for runtime configuration.
 * - Apply sensible defaults when variables are missing.
 * - Avoid logging sensitive values (passwords, secrets, raw keys).
 */

// Load variables from .env into process.env
dotenv.config();

/**
 * Helper: parse number with fallback.
 * Returns the parsed number or the provided default if parsing fails.
 */
function toNumber(val: string | undefined, fallback: number): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Build the typed environment object.
 * Note: never log secrets (passwords, raw private keys, tokens).
 */
const enviroment: Enviroment = {
  // Runtime
  nodeEnv: process.env.NODE_ENV || "development",
  apiPort: toNumber(process.env.API_PORT, 3000),
  appTz: process.env.TZ || "Europe/Rome",

  // PostgreSQL (do not log password)
  postgresUser: process.env.POSTGRES_USER || "postgres",
  postgresPassword: process.env.POSTGRES_PASSWORD || "postgres",
  postgresDB: process.env.POSTGRES_DB || "graphdb",
  postgresHost: process.env.POSTGRES_HOST || "postgres",
  postgresPort: toNumber(process.env.POSTGRES_PORT, 5432),

  // JWT configuration (paths only; never log raw key contents)
  jwtPrivateKeyPath:
    (process.env.JWT_PRIVATE_KEY_PATH ?? "").trim() || "../../keys/private.key",
  jwtPublicKeyPath:
    (process.env.JWT_PUBLIC_KEY_PATH ?? "").trim() || "../../keys/public.key",
  jwtExpiresIn: toNumber(process.env.JWT_EXPIRES_IN, 3600),
  jwtAlgorithm: process.env.JWT_ALGORITHM || "RS256",

  // Password security (support both SALT_ROUNDS and legacy JWT_SALT_ROUNDS)
  saltRounds: toNumber(
    process.env.SALT_ROUNDS ?? process.env.JWT_SALT_ROUNDS,
    12,
  ),

  // Initial tokens assigned to a newly created user
  initUserTokens: toNumber(process.env.INIT_USER_TOKENS, 0),

  // JWT claims
  jwtIssuer: (process.env.JWT_ISSUER ?? "").trim() || "myapp",
  jwtAudience: (process.env.JWT_AUDIENCE ?? "").trim() || "myapp-users",

  // Admin user configuration
  adminEmail: process.env.ADMIN_EMAIL || "admin@test.com",
  passwordAdmin: process.env.ADMIN_PASSWORD || "admin123",
  adminTokens: toNumber(process.env.ADMIN_TOKENS, 999),

  graphAlphaKey: toNumber(process.env.GRAPH_ALPHA, 0.9),
};

// Log non-sensitive configuration to trace initialization
logger.info("[Env] Environment loaded", {
  nodeEnv: enviroment.nodeEnv,
  apiPort: enviroment.apiPort,
  appTz: enviroment.appTz,
  db: {
    host: enviroment.postgresHost,
    port: enviroment.postgresPort,
    database: enviroment.postgresDB,
    user: enviroment.postgresUser,
  },
  jwt: {
    algorithm: enviroment.jwtAlgorithm,
    expiresIn: enviroment.jwtExpiresIn,
    privateKeyPath: enviroment.jwtPrivateKeyPath,
    publicKeyPath: enviroment.jwtPublicKeyPath,
    issuer: enviroment.jwtIssuer,
    audience: enviroment.jwtAudience,
  },
  security: {
    saltRounds: enviroment.saltRounds,
    initUserTokens: enviroment.initUserTokens,
  },
  admin: {
    email: enviroment.adminEmail,
    tokens: enviroment.adminTokens,
  },
  graph: {
    alphaKey: enviroment.graphAlphaKey,
  },
});

export default enviroment;
