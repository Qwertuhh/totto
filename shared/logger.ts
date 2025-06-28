/**
 * The logger module is responsible for logging messages to the console and to
 * log files. The logger is configured to log messages with a timestamp, log
 * level, and log message. The log level can be set to one of the following:
 * error, warn, info, verbose, debug, or silly. The log files are stored in the
 * logs directory and are named error.log and combined.log.
 *
 * In production mode, the logger is configured to log messages with a
 * timestamp, log level, and log message to the console and to the log files.
 * The log level is set to info.
 *
 * In development mode, the logger is configured to log messages with a
 * timestamp, log level, and log message to the console and to the log files.
 * The log level is set to info and the log messages are colorized.
 *
 * If the NODE_ENV environment variable is not set to production or
 * development, the logger will throw an error.
 */
import winston from "winston";
import dotenv from "dotenv";
import LokiTransport from "winston-loki";
import { type Metadata } from "./types";

//* Load environment variables
dotenv.config({ path: "../../env/.env" });

//* Define the metadata type
type TMetadata = winston.Logform.MetadataOptions & Metadata;

/**
 * A custom winston format function that formats a log message as a string.
 *
 * The log message is formatted with the following properties:
 *
 * - timestamp: The timestamp of the log message.
 * - level: The log level of the message (error, warn, info, verbose, debug, or
 *   silly).
 * - service: The name of the service that logged the message.
 * - message: The log message.
 *
 * @param info - The log message to format.
 * @returns The formatted log message as a string.
 */
const myFormat = winston.format.printf(
  ({
    level,
    message,
    timestamp,
    metadata,
  }: winston.Logform.TransformableInfo) => {
    return `${timestamp} [${level}] [${
      (metadata as Metadata).service
    }]: ${message}`;
  }
);

/**
 * Returns a winston format function that formats a log message as a JSON
 * object. The log message is formatted with the following properties:
 *
 * - timestamp: The timestamp of the log message.
 * - level: The log level of the message (error, warn, info, verbose, debug, or
 *   silly).
 * - service: The name of the service that logged the message.
 * - message: The log message.
 */
const jsonFormat = (metadata: TMetadata) =>
  winston.format.combine(
    winston.format.metadata(metadata),
    winston.format.timestamp(),
    myFormat,
    winston.format.json()
  );

/**
 * Returns a winston format function that formats a log message for console
 * output. The log message is formatted with the following properties:
 *
 * - timestamp: The timestamp of the log message.
 * - level: The log level of the message (error, warn, info, verbose, debug, or
 *   silly).
 * - service: The name of the service that logged the message.
 * - message: The log message.
 *
 * The message is formatted as a JSON object and colorized based on the log
 * level.
 */
const consoleFormat = (metadata: TMetadata) =>
  winston.format.combine(
    winston.format.colorize(),
    winston.format.splat(),
    winston.format.metadata(metadata),
    winston.format.timestamp(),
    myFormat
  );

/**
 * Returns a winston logger instance configured for production environments.
 * The logger is set to log messages at the "info" level by default and
 * includes metadata, timestamp, and JSON output. The logger is configured
 * with multiple transports:
 * - LokiTransport: Sends logs to a Loki instance for centralized logging.
 * - File transports: Logs messages to both error.log and combined.log files.
 * - Console transport: Logs messages to the console with colorization.
 *
 * The function accepts metadata to include in each log message, specifying
 * details such as the service name.
 * @param metadata - An object containing metadata options for logging.
 * @returns A winston logger instance configured for production use.
 */
function productionLogger(metadata: TMetadata) {
  const logger = winston.createLogger({
    level: "info",
    defaultMeta: metadata,
    format: consoleFormat(metadata),
    transports: [
      new LokiTransport({
        host: "http://127.0.0.1:3100/loki/api/v1/push",
        labels: { app: "backend", env: "production" },
        json: true,
        timeout: 4000,
        format: jsonFormat(metadata),
      }),
      new winston.transports.Console(),
    ],
  });
  return logger;
}

/**
 * Creates and returns a Winston logger instance configured for development
 * environments. The logger is set to log messages at the "info" level by
 * default and includes metadata, timestamp, and colorized console output.
 *
 * The logger is configured with multiple transports:
 * - LokiTransport: Sends logs to a Loki instance for centralized logging.
 * - File transports: Logs messages to both error.log and combined.log files.
 * - Console transport: Logs messages to the console with colorization.
 *
 * The function accepts metadata to include in each log message, specifying
 * details such as the service name.
 *
 * @param metadata - An object containing metadata options for logging.
 * @returns A Winston logger instance configured for development use.
 */
function developmentLogger(metadata: TMetadata) {
  const logger = winston.createLogger({
    level: "info",
    defaultMeta: metadata,
    format: consoleFormat(metadata),
    transports: [
      new LokiTransport({
        host: "http://127.0.0.1:3100/loki/api/v1/push",
        labels: { app: "backend", env: "production" },
        json: true,
        timeout: 4000,
        format: jsonFormat(metadata),
      }),
      new winston.transports.File({
        filename: "../../logs/error.log",
        level: "error",
        format: jsonFormat(metadata),
      }),
      new winston.transports.File({
        filename: "../../logs/combined.log",
        format: jsonFormat(metadata),
      }),
      new winston.transports.Console(),
    ],
  });

  return logger;
}

/**
 * Initializes a Winston logger instance for the given environment and
 * metadata. If the `NODE_ENV` environment variable is not set, it throws an
 * error.
 *
 * @param metadata - An object containing metadata options for logging. The
 *   `service` property is set to "root" by default if not provided.
 *
 * @returns A Winston logger instance configured for the given environment.
 */
const initLogger = (metadata: TMetadata = { service: "root" }) => {
  const environment = process.env.NODE_ENV;
  if (!environment) {
    throw new Error("NODE_ENV must be set to production or development");
  }

  const logger =
    environment === "production"
      ? productionLogger({ ...metadata, environment })
      : developmentLogger({ ...metadata, environment });

  logger.info(`Current environment is ${environment}!`);
  return logger;
};

export default initLogger;
