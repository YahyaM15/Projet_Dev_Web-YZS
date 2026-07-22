import { Prisma, PrismaClient, User } from '@prisma/client';

export class UserDao {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  public async updateRole(
    id: string,
    role: Prisma.UserUpdateInput['role'],
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
