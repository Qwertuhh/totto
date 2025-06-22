import initLogger from "@shared/logger";

const service = "frontend";
const logger = initLogger({ service});
logger.info(`${service} service logger initialized`);

export default logger;
