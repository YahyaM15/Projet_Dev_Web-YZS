import { Router } from 'express';

import { AuthController } from '../controllers/auth-controller';
import { authenticate } from '../middlewares/auth-middleware';
import { loginRateLimit } from '../middlewares/rate-limit-middleware';
import { validate } from '../middlewares/validate-middleware';
import { loginSchema, registerSchema } from '../schemas/auth-schema';

/**
 * @openapi
 * /auth/register:
 *   post: { tags: [Auth], summary: Register a user, security: [], responses: { '201': { description: User created }, '400': { description: Invalid request }, '409': { description: Email already exists } } }
 * /auth/login:
 *   post: { tags: [Auth], summary: Authenticate a user, security: [], responses: { '200': { description: Authenticated }, '400': { description: Invalid request }, '401': { description: Invalid credentials } } }
 * /auth/logout:
 *   post: { tags: [Auth], summary: Log out, security: [{ bearerAuth: [] }], responses: { '200': { description: Logged out }, '401': { description: Authentication required } } }
 * /auth/me:
 *   get: { tags: [Auth], summary: Get current profile, security: [{ bearerAuth: [] }], responses: { '200': { description: User profile }, '401': { description: Authentication required }, '404': { description: User not found } } }
 */

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
