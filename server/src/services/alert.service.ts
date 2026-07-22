import { Alert, AlertSeverity, ResourceType } from '@prisma/client';

import { AlertDao } from '../dao/alert.dao';
import { CounterDao } from '../dao/counter.dao';
import { HttpError } from '../errors/http-error';
import { ConfigureAlertThresholdInput } from '../schemas/alert-schema';

const toResourceType = (
  alertType: ConfigureAlertThresholdInput['alertType'],
): ResourceType => {
  return alertType === 'EAU' ? ResourceType.WATER : ResourceType.ELECTRICITY;
};

export class AlertService {
  public constructor(
    private readonly alertDao: AlertDao,
    private readonly counterDao: CounterDao,
  ) {}

  public async getAlerts(): Promise<Alert[]> {
    return this.alertDao.findAll();
  }

  public async resolveAlert(id: string): Promise<Alert> {
    const alert = await this.alertDao.findById(id);
    if (alert === null) {
      throw new HttpError(404, 'Alert not found.');
    }

    return this.alertDao.resolve(id);
  }

  public async setAlertThreshold(
    input: ConfigureAlertThresholdInput,
  ): Promise<Alert> {
    const counter = await this.counterDao.findById(input.counterId);
    if (counter === null) {
      throw new HttpError(404, 'Counter not found.');
    }

    return this.alertDao.create({
      meterId: input.counterId,
      type: toResourceType(input.alertType),
      severity: AlertSeverity.MEDIUM,
      message: `Alert threshold configured at ${input.threshold}.`,
    });
  }
}
