import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export interface ValidationTargets {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Validates request body/query/params against Zod schemas.
 * Replaces the corresponding field with the parsed value on success.
 */
export function validateRequest(targets: ValidationTargets): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const key of ['body', 'query', 'params'] as const) {
      const schema = targets[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        res.status(400).json({
          error: 'validation_error',
          target: key,
          issues: result.error.issues.map((i) => ({
            path: i.path,
            message: i.message,
          })),
        });
        return;
      }
      (req as unknown as Record<string, unknown>)[key] = result.data;
    }
    next();
  };
}
