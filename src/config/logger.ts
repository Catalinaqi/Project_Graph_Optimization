import { createLogger, format, transports } from "winston";

/**
 * Application Logger (Winston)
 *
 * Description:
 * Creates a centralized logger for the entire application.
 *
 * Objective:
 * - Provide consistent logging with timestamp, level, message, and optional metadata.
 * - Support configurable log level via environment variable `LOG_LEVEL` (default: debug).
 * - Include stack traces for errors.
 * - Print logs to console (can be extended to files, databases, etc.).
 */
const logger = createLogger({
  /**
   * Log level
   * Defines the minimum severity of logs that will be output.
   * Can be "error", "warn", "info", "debug", etc.
   */
  level: process.env.LOG_LEVEL || "debug",

  /**
   * Log format
   * - Adds ISO timestamps to each log entry.
   * - Includes stack traces for errors.
   * - Supports string interpolation (e.g., "value: %s").
   * - Serializes extra metadata as JSON.
   */
  format: format.combine(
    format.timestamp({
      format: () =>
        new Date().toLocaleString("it-IT", {
          timeZone: process.env.APP_TZ || "Europe/Rome",
          hour12: false,
        }) + `.${new Date().getMilliseconds().toString().padStart(3, "0")}`,
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
      return `${timestamp} ${level}: ${stack ?? message}${metaStr}`;
    }),
  ),

  /**
   * Transports
   * Defines the destination of log messages.
   * Currently configured to output logs to the console.
   */
  transports: [new transports.Console()],
});

export default logger;
