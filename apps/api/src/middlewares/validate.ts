import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/**
 * Validates req.body/params/query against a schema shaped as
 * z.object({ body?, params?, query? }) and replaces each with its parsed
 * (and coerced/defaulted) value. Throws ZodError on failure, handled by
 * the central error middleware.
 */
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    }) as { body?: unknown; params?: unknown; query?: unknown };

    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;
    if (parsed.query !== undefined) req.query = parsed.query as typeof req.query;

    next();
  };
}
