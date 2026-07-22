import {
  ConsumptionRecord,
  Prisma,
  PrismaClient,
} from '@prisma/client';

export class MetricDao {
  public constructor(private readonly prisma: PrismaClient) {}

  public async addRecord(
    data: Prisma.ConsumptionRecordUncheckedCreateInput,
  ): Promise<ConsumptionRecord> {
    return this.prisma.consumptionRecord.create({
      data,
    });
  }

  public async getLastRecordByMeterId(
    meterId: string,
  ): Promise<ConsumptionRecord | null> {
    return this.prisma.consumptionRecord.findFirst({
      where: { meterId },
      orderBy: { recordDate: 'desc' },
    });
  }

  public async getRecordsByPeriod(
    meterId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ConsumptionRecord[]> {
    return this.prisma.consumptionRecord.findMany({
      where: {
        meterId,
        recordDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  public async markAsAnomaly(id: string): Promise<ConsumptionRecord> {
    return this.prisma.consumptionRecord.update({
      where: { id },
      data: { isAnomaly: true },
    });
  }
}
