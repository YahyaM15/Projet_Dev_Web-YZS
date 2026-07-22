import { Meter, Prisma, PrismaClient } from '@prisma/client';

export class CounterDao {
  public constructor(private readonly prisma: PrismaClient) {}

  public async createMeter(
    data: Prisma.MeterUncheckedCreateInput,
  ): Promise<Meter> {
    return this.prisma.meter.create({
      data,
    });
  }

  public async findByUserId(userId: string): Promise<Meter[]> {
    return this.prisma.meter.findMany({
      where: { userId },
    });
  }

  public async findById(id: string): Promise<Meter | null> {
    return this.prisma.meter.findUnique({
      where: { id },
    });
  }

  public async deleteMeter(id: string): Promise<Meter> {
    return this.prisma.meter.delete({
      where: { id },
    });
  }
}
