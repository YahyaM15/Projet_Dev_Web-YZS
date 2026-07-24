import { CounterDao } from '../dao/counter.dao';
import { CalculationService } from './calculation.service';
import { GeocodingService } from './geocoding.service';
import { ConsumptionSimulator } from '../simulator';

interface CreateCounterData {
  type: 'WATER' | 'ELECTRICITY';
  counterNumber: string;
  address: string;
  userId: string;
}

interface UpdateCounterData {
  type?: 'WATER' | 'ELECTRICITY';
  counterNumber?: string;
  address?: string;
}

export class ResourceService {
  constructor(
    private readonly counterDao: CounterDao,
    private readonly calculationService: CalculationService,
    private readonly geocodingService: GeocodingService,
    private readonly simulator?: ConsumptionSimulator,
  ) {}

  getAllCounters() {
    return this.counterDao.findAll();
  }

  getCounterById(id: string) {
    return this.counterDao.findById(id);
  }

  async createCounter(data: CreateCounterData) {
    const coordinates = await this.geocodingService.geocode(data.address);

    const counter = await this.counterDao.create({
      serialNumber: data.counterNumber,
      type: data.type,
      location: data.address,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      userId: data.userId,
    });

    if (this.simulator !== undefined) {
      try {
        // The first demo reading is generated before returning the response,
        // so a newly created counter is immediately useful in the UI.
        await this.simulator.generateForMeter(counter);
      } catch (error) {
        console.warn('Counter created, but its first automatic reading failed.', error);
      }
    }

    return counter;
  }

  async updateCounter(id: string, data: UpdateCounterData) {
    const coordinates = data.address === undefined
      ? undefined
      : await this.geocodingService.geocode(data.address);

    return this.counterDao.update(id, {
      ...(data.type ? { type: data.type } : {}),
      ...(data.counterNumber ? { serialNumber: data.counterNumber } : {}),
      ...(data.address ? { location: data.address } : {}),
      ...(coordinates === undefined
        ? {}
        : {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }),
    });
  }

  getStats(meterId: string) {
    return this.calculationService.getStats(meterId);
  }

  async geocodeMissingCounters(): Promise<void> {
    const counters = await this.counterDao.findWithoutCoordinates();
    if (counters.length === 0) return;

    console.log(`📍 Geocoding ${counters.length} counter(s) without coordinates...`);

    for (const counter of counters) {
      try {
        const coordinates = await this.geocodingService.geocode(counter.location);
        await this.counterDao.update(counter.id, coordinates);
        console.log(`📍 ${counter.serialNumber} positioned automatically.`);
      } catch (error) {
        console.warn(
          `Unable to position ${counter.serialNumber} (${counter.location}).`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  }
}
