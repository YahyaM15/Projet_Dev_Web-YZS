import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodType } from 'zod';

import { HttpError } from '../errors/http-error';

export type ValidationTarget = 'body' | 'params' | 'query';

export const validate = (
  schema: ZodType,
  target: ValidationTarget = 'body',
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(new HttpError(400, 'Validation failed.', result.error.flatten()));
      return;
    }

    Object.assign(req[target], result.data);
    next();
  };
};
