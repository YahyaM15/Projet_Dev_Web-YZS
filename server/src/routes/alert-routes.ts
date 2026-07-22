import { Router } from 'express';

import { AlertController } from '../controllers/alert-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { validate } from '../middlewares/validate-middleware';
import {
  alertIdSchema,
  alertFilterSchema,
  configureAlertThresholdSchema,
} from '../schemas/alert-schema';

/**
 * @openapi
 * /alerts:
 *   get: { tags: [Alerts], summary: List alerts, security: [{ bearerAuth: [] }], responses: { '200': { description: Alert list }, '401': { description: Authentication required } } }
 * /alerts/{alertId}/resolve:
 *   patch: { tags: [Alerts], summary: Resolve an alert, security: [{ bearerAuth: [] }], parameters: [{ in: path, name: alertId, required: true, schema: { type: string } }], responses: { '200': { description: Alert resolved }, '400': { description: Invalid identifier }, '401': { description: Authentication required }, '404': { description: Alert not found } } }
 * /alerts/thresholds:
 *   post: { tags: [Alerts], summary: Configure an alert threshold, security: [{ bearerAuth: [] }], responses: { '201': { description: Threshold configured }, '400': { description: Invalid request }, '401': { description: Authentication required }, '404': { description: Counter not found } } }
 */

export const createAlertRouter = (
  controller: AlertController,
  jwtSecret: string,
): Router => {
  const router = Router();
  router.use(authenticate(jwtSecret));

  router.get('/', validate(alertFilterSchema, 'query'), controller.getAlerts);
  router.patch(
    '/:alertId/resolve',
    validate(alertIdSchema, 'params'),
    controller.resolveAlert,
  );
  router.post(
    '/thresholds',
    validate(configureAlertThresholdSchema),
    controller.setAlertThreshold,
  );

  return router;
};
