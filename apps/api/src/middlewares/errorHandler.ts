import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { MulterError } from "multer";
import { ApiError } from "@/utils/ApiError";
import { logger } from "@/utils/logger";
import { isProduction } from "@/config/env";

/**
 * `validate()` (see middlewares/validate.ts) always parses `{ body, params, query }` as one
 * object, so every Zod issue's path starts with that wrapper segment — e.g. `["body",
 * "startingPrice"]`. Zod's own `.flatten().fieldErrors` groups only by that FIRST segment,
 * collapsing every body-field error into one `errors.body` array with no indication of which
 * field it's actually about. This instead keys the map by the real field name (dropping the
 * "body" wrapper, since that's the overwhelming majority of validated input; "query"/"params"
 * are kept as a prefix to disambiguate the rarer case of a query/route-param validation error),
 * so a frontend form can highlight the exact field that failed.
 */
function zodErrorToFieldErrors(err: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const [wrapper, ...rest] = issue.path;
    const field = wrapper === "body" ? rest.join(".") : issue.path.join(".");
    (fieldErrors[field || "_"] ??= []).push(issue.message);
  }
  return fieldErrors;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: Record<string, string[]> | string[] | null | undefined = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = zodErrorToFieldErrors(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
        statusCode = 409;
        message = `A record with this ${target} already exists`;
        break;
      }
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      case "P2003":
        statusCode = 400;
        message = "Invalid reference to a related resource";
        break;
      default:
        statusCode = 400;
        message = "Database request failed";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided to the database";
  } else if (err instanceof MulterError) {
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message;
  } else if (err instanceof Error) {
    message = isProduction ? message : err.message;
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, message);
  } else {
    logger.warn({ path: req.originalUrl, method: req.method, statusCode }, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(!isProduction && err instanceof Error ? { stack: err.stack } : {}),
  });
}
