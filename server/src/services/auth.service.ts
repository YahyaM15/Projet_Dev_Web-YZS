import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { UserDao } from '../dao/user.dao';
import { HttpError } from '../errors/http-error';

export interface RegisterUserData {
  email: string;
  password: string;
  fullName: string;
  role?: Role;
}

export class AuthService {
  private static readonly BCRYPT_SALT_ROUNDS = 12;

  public constructor(
    private readonly userDao: UserDao,
    private readonly jwtSecret: string,
  ) {}

  public async register(data: RegisterUserData): Promise<User> {
    const password = await bcrypt.hash(
      data.password,
      AuthService.BCRYPT_SALT_ROUNDS,
    );

    return this.userDao.create({
      email: data.email,
      name: data.fullName,
      ...(data.role === undefined ? {} : { role: data.role }),
      password,
    });
  }

  public async login(email: string, password: string): Promise<string> {
    const user = await this.userDao.findByEmail(email);

    if (user === null || !(await bcrypt.compare(password, user.password))) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: '1d' } as jwt.SignOptions,
    );
  }

  public async getProfile(id: string): Promise<User> {
    const user = await this.userDao.findById(id);
    if (user === null) {
      throw new HttpError(404, 'User not found.');
    }

    return user;
  }
}
