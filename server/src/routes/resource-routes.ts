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
  updateCounterSchema,
} from '../schemas/resource-schema';

/**
 * @openapi
 * /resources:
 *   get: { tags: [Resources], summary: List counters, security: [{ bearerAuth: [] }], responses: { '200': { description: Counter list }, '401': { description: Authentication required }, '403': { description: Forbidden } } }
 *   post: { tags: [Resources], summary: Create a counter, security: [{ bearerAuth: [] }], responses: { '201': { description: Counter created }, '400': { description: Invalid request }, '401': { description: Authentication required }, '403': { description: Forbidden } } }
 * /resources/records:
 *   post: { tags: [Resources], summary: Record an index, security: [{ bearerAuth: [] }], responses: { '201': { description: Index recorded }, '400': { description: Invalid request }, '401': { description: Authentication required }, '404': { description: Counter not found } } }
 * /resources/{counterId}:
 *   get: { tags: [Resources], summary: Get a counter, security: [{ bearerAuth: [] }], parameters: [{ in: path, name: counterId, required: true, schema: { type: string } }], responses: { '200': { description: Counter }, '400': { description: Invalid identifier }, '401': { description: Authentication required }, '404': { description: Counter not found } } }
 * /resources/{counterId}/stats:
 *   get: { tags: [Resources], summary: Get consumption statistics, security: [{ bearerAuth: [] }], parameters: [{ in: path, name: counterId, required: true, schema: { type: string } }], responses: { '200': { description: Statistics }, '400': { description: Invalid identifier }, '401': { description: Authentication required }, '404': { description: Counter not found } } }
 */

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
  router.patch(
    '/:counterId',
    validate(counterIdSchema, 'params'),
    validate(updateCounterSchema),
    controller.updateCounter,
  );
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
