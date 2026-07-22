import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error';

export const requireRole = (...roles: readonly Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user === undefined) {
      next(new HttpError(401, 'Authentication required.'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'Forbidden.'));
      return;
    }

    next();
  };
};
