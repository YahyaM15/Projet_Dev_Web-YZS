import { ConsumptionRecord } from '@prisma/client';

import { MetricDao } from '../dao/metric.dao';

export interface CalculationResult {
  record: ConsumptionRecord;
  alert: string | null;
}

export interface NewConsumptionRecord {
  meterId: string;
  value: number;
  recordDate?: Date;
}

export class CalculationService {
  private static readonly ANOMALY_THRESHOLD = 0.5;

  public constructor(private readonly metricDao: MetricDao) {}

  public async processRecord(
    data: NewConsumptionRecord,
  ): Promise<CalculationResult> {
    const lastRecord = await this.metricDao.getLastRecordByMeterId(data.meterId);

    if (lastRecord !== null && data.value < lastRecord.value) {
      throw new Error('The new index cannot be lower than the previous index.');
    }

    const historicalRecords = await this.metricDao.getRecordsByPeriod(
      data.meterId,
      new Date(0),
      new Date(),
    );
    const average = this.calculateAverage(historicalRecords);
    const record = await this.metricDao.addRecord(data);

    if (
      average !== null &&
      data.value > average * (1 + CalculationService.ANOMALY_THRESHOLD)
    ) {
      const anomalousRecord = await this.metricDao.markAsAnomaly(record.id);

      return {
        record: anomalousRecord,
        alert: 'The metric exceeds the historical average by more than 50%.',
      };
    }

    return { record, alert: null };
  }

  private calculateAverage(
    records: readonly ConsumptionRecord[],
  ): number | null {
    if (records.length === 0) {
      return null;
    }

    const total = records.reduce(
      (sum: number, record: ConsumptionRecord): number => sum + record.value,
      0,
    );

    return total / records.length;
  }
}
