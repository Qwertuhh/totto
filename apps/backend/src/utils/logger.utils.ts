import initLogger from "@shared/logger";

const service = "backend";
const logger = initLogger({ service });
logger.info(`${service} service logger initialized`);

export default logger;
