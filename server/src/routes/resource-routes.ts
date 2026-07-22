import { Role } from '@prisma/client';
import { Router } from 'express';

import { ResourceController } from '../controllers/resource-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { requireRole } from '../middlewares/rbac-middleware';
import { validate } from '../middlewares/validate-middleware';
import {
  counterIdSchema,
  createCounterSchema,
  recordIndexSchema,
} from '../schemas/resource-schema';

export const createResourceRouter = (
  controller: ResourceController,
  jwtSecret: string,
): Router => {
  const router = Router();
  router.use(authenticate(jwtSecret));
  router.use(requireRole(Role.ADMIN, Role.MANAGER, Role.RESIDENTIAL));

  router.get('/', controller.getAllCounters);
  router.post('/', validate(createCounterSchema), controller.createCounter);
  router.post('/records', validate(recordIndexSchema), controller.recordMetric);
  router.get(
    '/:counterId',
    validate(counterIdSchema, 'params'),
    controller.getCounterById,
  );
  router.get(
    '/:counterId/stats',
    validate(counterIdSchema, 'params'),
    controller.getConsumptionStats,
  );

  return router;
};
