import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { UserDao } from '../dao/user.dao';
import { HttpError } from '../errors/http-error';

export class AuthService {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtSecret: string,
  ) {}

  async register(data: { email: string; password: string; fullName: string; role?: string }): Promise<{ id: string; email: string; name: string; role: string }> {
    const existing = await this.userDao.findByEmail(data.email);
    if (existing) throw new HttpError(409, 'Email already registered.');

    const hashedPassword = await argon2.hash(data.password);
    const user = await this.userDao.create({
      email: data.email,
      password: hashedPassword,
      name: data.fullName,
      role: (data.role as any) ?? 'RESIDENTIAL',
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userDao.findByEmail(email);
    if (!user) throw new HttpError(401, 'Invalid email or password.');

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new HttpError(401, 'Invalid email or password.');

    return jwt.sign({ sub: user.id, role: user.role }, this.jwtSecret, { expiresIn: '24h' });
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; name: string; role: string; createdAt: Date }> {
    const user = await this.userDao.findById(userId);
    if (!user) throw new HttpError(404, 'User not found.');
    return { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
  }
}
