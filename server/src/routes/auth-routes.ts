import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { validate } from '../middlewares/validate-middleware';
import { loginSchema, registerSchema } from '../schemas/auth-schema';

export const createAuthRouter = (controller: AuthController, jwtSecret: string): Router => {
  const router = Router();

  router.post('/register', validate(registerSchema), controller.register);
  router.post('/login', validate(loginSchema), controller.login);
  router.post('/logout', authenticate(jwtSecret), controller.logout);
  router.get('/me', authenticate(jwtSecret), controller.me);

  return router;
};
