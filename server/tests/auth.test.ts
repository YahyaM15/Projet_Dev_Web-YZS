import { Router } from 'express';
import request from 'supertest';

import { createApp } from '../src/app';
import { AppError } from '../src/errors/AppError';
import { createAuthRouter } from '../src/routes/auth-routes';

const authController = {
  register: (_req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }): void => {
    res.status(201).json({ success: true });
  },
  login: (_req: unknown, _res: unknown, next: (error: Error) => void): void => {
    next(new AppError(401, 'Invalid email or password.'));
  },
  logout: (): void => undefined,
  me: (): void => undefined,
};

const apiRouter = Router();
apiRouter.use('/api/v1/auth', createAuthRouter(authController as never, 'test-secret'));
const app = createApp({ apiRouter });

describe('Authentication validation', () => {
  it('rejects registration with an invalid e-mail address', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: 'StrongPassword1!',
      fullName: 'Test User',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ success: false, message: 'Validation failed.' });
    expect(response.body.errors).toBeInstanceOf(Array);
  });

  it('rejects login with invalid credentials', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, message: 'Invalid email or password.' });
  });
});
