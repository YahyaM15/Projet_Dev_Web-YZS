import { Meter, PrismaClient } from '@prisma/client';

type CounterCreateData = {
  serialNumber: string;
  type: 'WATER' | 'ELECTRICITY';
  location: string;
  latitude: number;
  longitude: number;
  userId: string;
};

type CounterUpdateData = {
  serialNumber?: string;
  type?: 'WATER' | 'ELECTRICITY';
  location?: string;
  latitude?: number;
  longitude?: number;
};

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

  findWithoutCoordinates(): Promise<Meter[]> {
    return this.prisma.meter.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
    });
  }

  create(data: CounterCreateData): Promise<Meter> {
    return this.prisma.meter.create({ data });
  }

  update(id: string, data: CounterUpdateData): Promise<Meter> {
    return this.prisma.meter.update({ where: { id }, data });
  }

  delete(id: string): Promise<Meter> {
    return this.prisma.meter.delete({ where: { id } });
  }
}
