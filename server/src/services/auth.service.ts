import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { UserDao } from '../dao/user.dao';

export class AuthService {
  private static readonly BCRYPT_SALT_ROUNDS = 12;

  public constructor(
    private readonly userDao: UserDao,
    private readonly jwtSecret: string,
  ) {}

  public async register(data: Prisma.UserCreateInput): Promise<User> {
    const password = await bcrypt.hash(
      data.password,
      AuthService.BCRYPT_SALT_ROUNDS,
    );

    return this.userDao.create({
      ...data,
      password,
    });
  }

  public async login(email: string, password: string): Promise<string> {
    const user = await this.userDao.findByEmail(email);

    if (user === null || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid email or password');
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
}
