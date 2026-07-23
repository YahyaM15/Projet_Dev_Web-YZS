import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { HttpError } from '../errors/http-error';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  const zodErr = (err as { issues?: Array<{ path: (string | symbol)[]; message: string; code: string }> })?.issues;
  if (zodErr && Array.isArray(zodErr)) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: zodErr.map((e) => ({
        path: e.path.filter((p): p is string => typeof p === 'string').join('.'),
        message: e.message,
        code: e.code,
      })),
    });
    return;
  }

  if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const isUniqueConstraint = err.code === 'P2002';
    res.status(isUniqueConstraint ? 409 : 400).json({
      success: false,
      message: isUniqueConstraint ? 'Resource already exists.' : 'Invalid database request.',
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid request data.' });
    return;
  }

  res.status(500).json({ success: false, message: 'Internal server error.' });
};
