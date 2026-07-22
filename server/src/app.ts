import cookieParser from 'cookie-parser';
import express, { Express, Router } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';

export interface CreateAppOptions {
  apiRouter: Router;
}

/** Creates the HTTP application without binding a network port (safe for tests). */
export const createApp = ({ apiRouter }: CreateAppOptions): Express => {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(apiRouter);
  app.use(errorHandler);

  return app;
};
