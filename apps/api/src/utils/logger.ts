import pino from "pino";
import { isDevelopment, env } from "@/config/env";

export const logger = pino(
  env.NODE_ENV === "test"
    ? { level: "silent" }
    : isDevelopment
      ? {
          level: "debug",
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
          },
        }
      : { level: "info" }
);
