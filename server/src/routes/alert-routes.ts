import { Router } from 'express';

import { AlertController } from '../controllers/alert-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { validate } from '../middlewares/validate-middleware';
import {
  alertIdSchema,
  configureAlertThresholdSchema,
} from '../schemas/alert-schema';

export const createAlertRouter = (
  controller: AlertController,
  jwtSecret: string,
): Router => {
  const router = Router();
  router.use(authenticate(jwtSecret));

  router.get('/', controller.getAlerts);
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
