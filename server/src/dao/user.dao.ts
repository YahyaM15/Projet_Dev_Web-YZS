import { PrismaClient, User } from '@prisma/client';

export class UserDao {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { email: string; password: string; name: string; role?: 'ADMIN' | 'MANAGER' | 'RESIDENTIAL' }): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
