import { Role } from '@prisma/client';
import { Router } from 'express';
import { AlertController } from '../controllers/alert-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { requireRole } from '../middlewares/rbac-middleware';

export const createAlertRouter = (controller: AlertController, jwtSecret: string): Router => {
  const router = Router();
  router.use(authenticate(jwtSecret));
  router.use(requireRole(Role.ADMIN, Role.MANAGER, Role.RESIDENTIAL));

  router.get('/', controller.getAll);
  router.patch('/:id/resolve', controller.resolve);
  router.post('/thresholds', controller.setThreshold);

  return router;
};
