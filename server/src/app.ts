import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Router } from 'express';
import helmet from 'helmet';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/errorHandler';
import swaggerUi from 'swagger-ui-express';

export interface CreateAppOptions {
  apiRouter: Router;
}

const CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'];

export const createApp = ({ apiRouter }: CreateAppOptions): Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(apiRouter);
  app.use(errorHandler);

  return app;
};
