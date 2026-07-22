import { Router } from 'express';

import { AuthController } from '../controllers/auth-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { loginRateLimit } from '../middlewares/rate-limit-middleware';
import { validate } from '../middlewares/validate-middleware';
import { loginSchema, registerSchema } from '../schemas/auth-schema';

export const createAuthRouter = (
  controller: AuthController,
  jwtSecret: string,
): Router => {
  const router = Router();
  const authMiddleware = authenticate(jwtSecret);

  router.post('/register', validate(registerSchema), controller.register);
  router.post('/login', loginRateLimit, validate(loginSchema), controller.login);
  router.post('/logout', authMiddleware, controller.logout);
  router.get('/me', authMiddleware, controller.me);

  return router;
};
