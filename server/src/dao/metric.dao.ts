import { ConsumptionRecord, PrismaClient } from '@prisma/client';

export class MetricDao {
  constructor(private readonly prisma: PrismaClient) {}

  create(data: { meterId: string; value: number; recordDate: Date }): Promise<ConsumptionRecord> {
    return this.prisma.consumptionRecord.create({ data });
  }

  findByMeterId(meterId: string, limit = 100): Promise<ConsumptionRecord[]> {
    return this.prisma.consumptionRecord.findMany({
      where: { meterId },
      orderBy: { recordDate: 'desc' },
      take: limit,
    });
  }

  getStats(meterId: string): Promise<{ count: number; total: number; average: number | null }> {
    return this.prisma.consumptionRecord.aggregate({
      where: { meterId },
      _count: true,
      _sum: { value: true },
      _avg: { value: true },
    }).then((r) => ({
      count: r._count,
      total: r._sum.value ?? 0,
      average: r._avg.value,
    }));
  }

  getTotalConsumption(meterId: string): Promise<number> {
    return this.prisma.consumptionRecord.aggregate({
      where: { meterId },
      _sum: { value: true },
    }).then((r) => r._sum.value ?? 0);
  }

  findRecent(meterId: string, hours: number): Promise<ConsumptionRecord[]> {
    const since = new Date(Date.now() - hours * 3600000);
    return this.prisma.consumptionRecord.findMany({
      where: { meterId, recordDate: { gte: since } },
      orderBy: { recordDate: 'desc' },
    });
  }
}
