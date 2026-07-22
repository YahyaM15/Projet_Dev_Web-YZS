import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodType } from 'zod';

export type ValidationTarget = 'body' | 'params' | 'query';

/** Validates and replaces an Express request segment with Zod's parsed output. */
export const validateRequest = <T>(
  schema: ZodType<T>,
  target: ValidationTarget = 'body',
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(result.error);
      return;
    }

    Object.assign(req[target], result.data);
    next();
  };
};
