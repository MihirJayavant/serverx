/**
 * Logger interface for structured logging
 * Implementations can use different logging libraries (pino, winston, bunyan, etc.)
 */

/**
 * Log levels supported by the logger
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Logger type for structured logging
 */
export type Logger = {
  /**
   * Log a debug message
   */
  debug(message: string, data?: Record<string, unknown>): void;

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, unknown>): void;

  /**
   * Log a warning message
   */
  warn(message: string, data?: Record<string, unknown>): void;

  /**
   * Log an error message
   */
  error(message: string, error?: Error | Record<string, unknown>): void;
};

/**
 * Logger configuration options
 */
export type LoggerConfig = {
  /**
   * Minimum log level to output
   * @default "info"
   */
  level?: LogLevel;
};
