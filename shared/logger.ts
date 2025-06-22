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
dotenv.config({ path: "../../env/.env" });

interface MetadataConfig extends winston.Logform.MetadataOptions {
  service: string;
}
interface Metadata extends MetadataConfig {
  environment?: string;
}
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

function productionLogger(
  metadata: winston.Logform.MetadataOptions & Metadata
) {
  const logger = winston.createLogger({
    level: "info",
    defaultMeta: metadata,
    format: winston.format.combine(  winston.format.metadata(metadata),
    winston.format.timestamp(),
    myFormat,
    winston.format.json()
    ),
    transports: [
      new winston.transports.File({
        filename: "../../logs/error.log",
        level: "error",
      }),
      new winston.transports.File({ filename: "../../logs/combined.log" }),
      new winston.transports.Console(),
    ],
  });
  return logger;
}

function developmentLogger(
  metadata: winston.Logform.MetadataOptions & Metadata
) {
  const logger = winston.createLogger({
    level: "info",
    defaultMeta: metadata,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.metadata(metadata),
      winston.format.timestamp(),
      myFormat
    ),
    transports: [
      new winston.transports.File({
        filename: "../../logs/error.log",
        level: "error",
      }),
      new winston.transports.File({ filename: "../../logs/combined.log" }),
      new winston.transports.Console(),
    ],
  });

  return logger;
}


const initLogger = (
  metadata: winston.Logform.MetadataOptions & Metadata = { service: "root" }
) =>{
  const environment = process.env.NODE_ENV;
  if (!environment) {
    throw new Error("NODE_ENV must be set to production or development");
  }

  const logger =
    environment === "production"
      ? productionLogger({ environment, ...metadata })
      : developmentLogger({ environment, ...metadata });

  logger.info(`Current environment is ${environment}!`);
  return logger;
}

export default initLogger;