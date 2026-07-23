import { CounterDao } from '../dao/counter.dao';
import { CalculationService } from './calculation.service';

export class ResourceService {
  constructor(
    private readonly counterDao: CounterDao,
    private readonly calculationService: CalculationService,
  ) {}

  getAllCounters() {
    return this.counterDao.findAll();
  }

  getCounterById(id: string) {
    return this.counterDao.findById(id);
  }

  createCounter(data: { type: 'WATER' | 'ELECTRICITY'; counterNumber: string; address: string; userId: string }) {
    return this.counterDao.create({
      serialNumber: data.counterNumber,
      type: data.type,
      location: data.address,
      userId: data.userId,
    });
  }

  updateCounter(id: string, data: { type?: 'WATER' | 'ELECTRICITY'; counterNumber?: string; address?: string }) {
    return this.counterDao.update(id, {
      ...(data.type ? { type: data.type } : {}),
      ...(data.counterNumber ? { serialNumber: data.counterNumber } : {}),
      ...(data.address ? { location: data.address } : {}),
    });
  }

  getStats(meterId: string) {
    return this.calculationService.getStats(meterId);
  }
}
