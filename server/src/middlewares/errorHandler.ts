import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../errors/http-error';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  const zodErr = (err as any)?.issues;
  if (zodErr && Array.isArray(zodErr)) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: zodErr.map((e: { path: (string | symbol)[]; message: string; code: string }) => ({
        path: e.path.filter((p): p is string => typeof p === 'string').join('.'),
        message: e.message,
        code: e.code,
      })),
    });
    return;
  }

  console.error('[errorHandler] Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
};
