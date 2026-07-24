import { AlertDao } from '../dao/alert.dao';
import { CounterDao } from '../dao/counter.dao';

export class AlertService {
  constructor(
    private readonly alertDao: AlertDao,
    private readonly counterDao: CounterDao,
  ) {}

  getAll(filters?: { resolved?: string; type?: string; severity?: string }) {
    const where: any = {};
    if (filters?.resolved !== undefined) where.resolved = filters.resolved === 'true';
    if (filters?.type) where.type = filters.type;
    if (filters?.severity) where.severity = filters.severity;
    return this.alertDao.findAll(where);
  }

  resolve(id: string) {
    return this.alertDao.resolve(id);
  }

  async setThreshold(data: { counterId: string; threshold: number; alertType: string }) {
    const meter = await this.counterDao.findById(data.counterId);
    if (!meter) throw new Error('Counter not found');
    return this.alertDao.create({
      meterId: data.counterId,
      type: data.alertType as any,
      message: `Seuil configuré: ${data.threshold} pour ${data.alertType}`,
      severity: 'LOW',
    });
  }
}
