import { Alert, Prisma, PrismaClient } from '@prisma/client';

export class AlertDao {
  public constructor(private readonly prisma: PrismaClient) {}

  public async findAll(): Promise<Alert[]> {
    return this.prisma.alert.findMany({ orderBy: { createdAt: 'desc' } });
  }

  public async findById(id: string): Promise<Alert | null> {
    return this.prisma.alert.findUnique({ where: { id } });
  }

  public async create(data: Prisma.AlertUncheckedCreateInput): Promise<Alert> {
    return this.prisma.alert.create({ data });
  }

  public async resolve(id: string): Promise<Alert> {
    return this.prisma.alert.update({
      where: { id },
      data: { isResolved: true },
    });
  }
}
