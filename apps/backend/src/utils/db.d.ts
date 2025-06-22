import type { Connection } from "mongoose";

declare global {
  var mongooseCache:
    | {
        conn: Connection | null;
        promise: Promise<typeof import("mongoose")> | null;
      }
    | undefined;
}

export {};
