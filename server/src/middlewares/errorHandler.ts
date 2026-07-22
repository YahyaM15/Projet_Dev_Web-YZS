import { Prisma } from '@prisma/client';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';

import { AppError } from '../errors/AppError';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string; code: string }>;
}

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const isUniqueConstraint = error.code === 'P2002';
    res.status(isUniqueConstraint ? 409 : 400).json({
      success: false,
      message: isUniqueConstraint ? 'Resource already exists.' : 'Invalid database request.',
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid request data.' });
    return;
  }

  res.status(500).json({ success: false, message: 'Internal server error.' });
};
