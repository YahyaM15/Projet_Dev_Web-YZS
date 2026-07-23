import { MetricDao } from '../dao/metric.dao';

export class CalculationService {
  constructor(private readonly metricDao: MetricDao) {}

  async getStats(meterId: string) {
    return this.metricDao.getStats(meterId);
  }
}
