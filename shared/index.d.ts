import logger from "./logger";
import type { IUser, ITicket, Metadata } from "./types";
import winston from "winston";
declare global {
  namespace shared {
    export type { IUser, ITicket,  Metadata } ;
    export function  initLogger(metadata: winston.Logform.MetadataOptions & Metadata): typeof logger;
  }
}
