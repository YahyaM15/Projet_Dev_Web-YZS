import { Meter, PrismaClient } from '@prisma/client';

export class CounterDao {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<Meter[]> {
    return this.prisma.meter.findMany();
  }

  findById(id: string): Promise<Meter | null> {
    return this.prisma.meter.findUnique({ where: { id } });
  }

  findByUserId(userId: string): Promise<Meter[]> {
    return this.prisma.meter.findMany({ where: { userId } });
  }

  create(data: { serialNumber: string; type: 'WATER' | 'ELECTRICITY'; location: string; userId: string }): Promise<Meter> {
    return this.prisma.meter.create({ data });
  }

  update(id: string, data: { serialNumber?: string; type?: 'WATER' | 'ELECTRICITY'; location?: string }): Promise<Meter> {
    return this.prisma.meter.update({ where: { id }, data });
  }

  delete(id: string): Promise<Meter> {
    return this.prisma.meter.delete({ where: { id } });
  }
}
