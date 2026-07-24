import { Meter, PrismaClient, ResourceType } from '@prisma/client';

type MeterSnapshot = Pick<Meter, 'id' | 'serialNumber' | 'type'>;

export class ConsumptionSimulator {
  private timer: NodeJS.Timeout | null = null;
  private tickInProgress = false;

  public constructor(
    private readonly prisma: PrismaClient,
    private readonly intervalMs = 30_000,
  ) {}

  public start(): void {
    if (this.timer !== null) return;

    console.log(
      `📈 Automatic consumption simulator enabled (${this.intervalMs / 1_000}s interval).`,
    );

    void this.generateForAllMeters();
    this.timer = setInterval(() => {
      void this.generateForAllMeters();
    }, this.intervalMs);
  }

  public stop(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
    console.log('🛑 Automatic consumption simulator stopped.');
  }

  public async generateForMeter(meter: MeterSnapshot): Promise<void> {
    const previousRecords = await this.prisma.consumptionRecord.findMany({
      where: { meterId: meter.id },
      orderBy: { recordDate: 'desc' },
      take: 10,
    });

    const regularValue = this.createRegularValue(meter.type);
    const shouldCreateSpike = previousRecords.length >= 3 && Math.random() < 0.05;
    const value = Math.round(
      regularValue * (shouldCreateSpike ? 2 + Math.random() : 1) * 100,
    ) / 100;

    const average = previousRecords.length === 0
      ? null
      : previousRecords.reduce((sum, record) => sum + record.value, 0)
        / previousRecords.length;

    const isAnomaly = average !== null && value > average * 1.5;

    await this.prisma.consumptionRecord.create({
      data: {
        meterId: meter.id,
        value,
        recordDate: new Date(),
        isAnomaly,
      },
    });

    if (isAnomaly && average !== null) {
      const existingAlert = await this.prisma.alert.findFirst({
        where: { meterId: meter.id, isResolved: false },
      });

      if (existingAlert === null) {
        await this.prisma.alert.create({
          data: {
            meterId: meter.id,
            type: meter.type,
            message: `Consommation anormale sur ${meter.serialNumber}: ${value.toFixed(1)} (moyenne: ${average.toFixed(1)})`,
            severity: value > average * 2 ? 'HIGH' : 'MEDIUM',
          },
        });
      }
    }

    console.log(
      `📊 ${meter.serialNumber}: ${value.toFixed(1)} ${meter.type === 'WATER' ? 'L' : 'Wh'}`,
    );
  }

  private async generateForAllMeters(): Promise<void> {
    if (this.tickInProgress) return;
    this.tickInProgress = true;

    try {
      const meters = await this.prisma.meter.findMany({
        select: { id: true, serialNumber: true, type: true },
      });

      await Promise.all(meters.map((meter) => this.generateForMeter(meter)));
    } catch (error) {
      console.error('Automatic simulator error:', error);
    } finally {
      this.tickInProgress = false;
    }
  }

  private createRegularValue(type: ResourceType): number {
    return type === 'WATER'
      ? 10 + Math.random() * 20
      : 100 + Math.random() * 100;
  }
}
