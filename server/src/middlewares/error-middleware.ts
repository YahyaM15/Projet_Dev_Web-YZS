import { Prisma } from '@prisma/client';
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details === undefined ? {} : { errors: err.details }),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = err.code === 'P2002' ? 409 : 400;
    const message = err.code === 'P2002' ? 'Resource already exists.' : 'Invalid database request.';
    res.status(statusCode).json({ success: false, message });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid request data.' });
    return;
  }

  res.status(500).json({ success: false, message: 'Internal server error.' });
};
