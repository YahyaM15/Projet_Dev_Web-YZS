import { Router } from 'express';

import { AlertController } from '../controllers/alert-controller';
import { AuthController } from '../controllers/auth-controller';
import { ResourceController } from '../controllers/resource-controller';
import { createAlertRouter } from './alert-routes';
import { createAuthRouter } from './auth-routes';
import { createResourceRouter } from './resource-routes';

export interface ApiRouterDependencies {
  jwtSecret: string;
  authController: AuthController;
  resourceController: ResourceController;
  alertController: AlertController;
}

export const createApiRouter = (dependencies: ApiRouterDependencies): Router => {
  const router = Router();

  router.use('/api/v1/auth', createAuthRouter(dependencies.authController, dependencies.jwtSecret));
  router.use(
    '/api/v1/resources',
    createResourceRouter(dependencies.resourceController, dependencies.jwtSecret),
  );
  router.use('/api/v1/alerts', createAlertRouter(dependencies.alertController, dependencies.jwtSecret));
  return router;
};
