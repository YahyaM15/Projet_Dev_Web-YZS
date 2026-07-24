import { RequestHandler } from 'express';

/** Forwards rejected promises from async route handlers to Express's error handler. */
export const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return (req, res, next): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
