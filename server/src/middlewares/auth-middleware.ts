import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { HttpError } from '../errors/http-error';

interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  role: Role;
}

const getToken = (req: Request): string | undefined => {
  const cookieToken = req.cookies?.jwt;
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  const authorization = req.header('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length);
  }

  return undefined;
};

export const authenticate = (jwtSecret: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const token = getToken(req);

    if (token === undefined) {
      next(new HttpError(401, 'Authentication required.'));
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      if (
        typeof decoded === 'string' ||
        typeof decoded.sub !== 'string' ||
        !Object.values(Role).includes(decoded.role as Role)
      ) {
        next(new HttpError(401, 'Invalid authentication token.'));
        return;
      }

      req.user = { userId: decoded.sub, role: decoded.role as Role };
      next();
    } catch {
      next(new HttpError(401, 'Invalid or expired authentication token.'));
    }
  };
};
