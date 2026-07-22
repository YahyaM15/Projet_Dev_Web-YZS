import { Meter, ResourceType } from '@prisma/client';

import { CounterDao } from '../dao/counter.dao';
import { HttpError } from '../errors/http-error';
import {
  CreateCounterInput,
  RecordIndexInput,
  UpdateCounterInput,
} from '../schemas/resource-schema';
import { CalculationResult, CalculationService } from './calculation.service';

export interface ConsumptionStats {
  count: number;
  total: number;
  average: number | null;
}

const toResourceType = (type: CreateCounterInput['type']): ResourceType => {
  return type === 'EAU' ? ResourceType.WATER : ResourceType.ELECTRICITY;
};

export class ResourceService {
  public constructor(
    private readonly counterDao: CounterDao,
    private readonly calculationService: CalculationService,
  ) {}

  public async getAllCounters(userId: string): Promise<Meter[]> {
    return this.counterDao.findByUserId(userId);
  }

  public async getCounterById(id: string, userId: string): Promise<Meter> {
    const counter = await this.counterDao.findById(id);
    if (counter === null || counter.userId !== userId) {
      throw new HttpError(404, 'Counter not found.');
    }

    return counter;
  }

  public async createCounter(
    userId: string,
    input: CreateCounterInput,
  ): Promise<Meter> {
    return this.counterDao.createMeter({
      serialNumber: input.counterNumber,
      type: toResourceType(input.type),
      location: input.address,
      userId,
    });
  }

  public async updateCounter(
    counterId: string,
    userId: string,
    input: UpdateCounterInput,
  ): Promise<Meter> {
    await this.getCounterById(counterId, userId);
    return this.counterDao.updateMeter(counterId, {
      ...(input.type === undefined ? {} : { type: toResourceType(input.type) }),
      ...(input.counterNumber === undefined ? {} : { serialNumber: input.counterNumber }),
      ...(input.address === undefined ? {} : { location: input.address }),
    });
  }

  public async recordMetric(
    userId: string,
    input: RecordIndexInput,
  ): Promise<CalculationResult> {
    await this.getCounterById(input.counterId, userId);
    return this.calculationService.processRecord({
      meterId: input.counterId,
      value: input.value,
      recordDate: input.timestamp,
    });
  }

  public async getConsumptionStats(
    counterId: string,
    userId: string,
  ): Promise<ConsumptionStats> {
    await this.getCounterById(counterId, userId);
    const records = await this.calculationService.getHistoricalRecords(counterId);
    const total = records.reduce((sum: number, record): number => sum + record.value, 0);

    return {
      count: records.length,
      total,
      average: records.length === 0 ? null : total / records.length,
    };
  }
}
