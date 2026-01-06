/**
 * Logger utility for environment-aware logging
 * Supports configurable log levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LoggerOptions {
  prefix?: string;
  showTimestamp?: boolean;
}

const isDevelopment = process.env.NODE_ENV === "development";

// Default to DEBUG in development, WARN in production
let currentLogLevel: LogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

export const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
};

export const getLogLevel = (): LogLevel => currentLogLevel;

const formatMessage = (
  level: string,
  message: string,
  options?: LoggerOptions
): string => {
  const parts: string[] = [];

  if (options?.showTimestamp) {
    parts.push(`[${new Date().toISOString()}]`);
  }

  parts.push(`[${level}]`);

  if (options?.prefix) {
    parts.push(`[${options.prefix}]`);
  }

  parts.push(message);

  return parts.join(" ");
};

export const logger = {
  debug: (message: string, data?: unknown, options?: LoggerOptions): void => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      if (data !== undefined) {
        console.debug(formatMessage("DEBUG", message, options), data);
      } else {
        console.debug(formatMessage("DEBUG", message, options));
      }
    }
  },

  info: (message: string, data?: unknown, options?: LoggerOptions): void => {
    if (currentLogLevel <= LogLevel.INFO) {
      if (data !== undefined) {
        console.info(formatMessage("INFO", message, options), data);
      } else {
        console.info(formatMessage("INFO", message, options));
      }
    }
  },

  warn: (message: string, data?: unknown, options?: LoggerOptions): void => {
    if (currentLogLevel <= LogLevel.WARN) {
      if (data !== undefined) {
        console.warn(formatMessage("WARN", message, options), data);
      } else {
        console.warn(formatMessage("WARN", message, options));
      }
    }
  },

  error: (message: string, data?: unknown, options?: LoggerOptions): void => {
    if (currentLogLevel <= LogLevel.ERROR) {
      if (data !== undefined) {
        console.error(formatMessage("ERROR", message, options), data);
      } else {
        console.error(formatMessage("ERROR", message, options));
      }
    }
  },

  // Group related logs
  group: (label: string, fn: () => void): void => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  // Table for data visualization
  table: (data: unknown): void => {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.table(data);
    }
  },
};

export default logger;

// Create prefixed loggers for different modules
export const createLogger = (prefix: string) => ({
  debug: (message: string, data?: unknown) =>
    logger.debug(message, data, { prefix }),
  info: (message: string, data?: unknown) =>
    logger.info(message, data, { prefix }),
  warn: (message: string, data?: unknown) =>
    logger.warn(message, data, { prefix }),
  error: (message: string, data?: unknown) =>
    logger.error(message, data, { prefix }),
});
