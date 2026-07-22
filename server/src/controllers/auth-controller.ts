import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error';
import { LoginInput, RegisterInput } from '../schemas/auth-schema';
import { AuthService } from '../services/auth.service';

export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  public register = async (
    req: Request<Record<string, string>, unknown, RegisterInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error: unknown) {
      next(error);
    }
  };

  public login = async (
    req: Request<Record<string, string>, unknown, LoginInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = await this.authService.login(req.body.email, req.body.password);
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86_400_000,
      });
      res.json({ success: true, data: { token } });
    } catch (error: unknown) {
      next(error);
    }
  };

  public logout = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'strict' });
      res.json({ success: true, data: null });
    } catch (error: unknown) {
      next(error);
    }
  };

  public me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (req.user === undefined) {
        throw new HttpError(401, 'Authentication required.');
      }

      const user = await this.authService.getProfile(req.user.userId);
      res.json({ success: true, data: user });
    } catch (error: unknown) {
      next(error);
    }
  };
}
