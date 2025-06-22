import jwt from "jsonwebtoken";
import logger from "@/utils/logger.utils";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  auth: string | jwt.JwtPayload;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const xForwarded = (req.headers["x-forwarded-for"] as string) || "";
  const IP =
    req.ip ||
    xForwarded.split(",")[0] ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress;

  if (!IP) {
    logger.error("IP not found");
    return res.status(400).json({ message: "IP not found" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      logger.info("Token Unauthorized from IP: " + IP);
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.auth = decoded;
    logger.info("Token Authorized from IP: " + IP);
    next();
  } catch (error) {
    logger.error("Token Unauthorized from IP: " + IP);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default auth;
