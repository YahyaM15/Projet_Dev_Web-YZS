import { NextFunction, Request, Response } from 'express';

import { ConfigureAlertThresholdInput } from '../schemas/alert-schema';
import { AlertService } from '../services/alert.service';

export class AlertController {
  public constructor(private readonly alertService: AlertService) {}

  public getAlerts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = await this.alertService.getAlerts();
      res.json({ success: true, data: alerts });
    } catch (error: unknown) {
      next(error);
    }
  };

  public resolveAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await this.alertService.resolveAlert(req.params.alertId as string);
      res.json({ success: true, data: alert });
    } catch (error: unknown) {
      next(error);
    }
  };

  public setAlertThreshold = async (
    req: Request<Record<string, string>, unknown, ConfigureAlertThresholdInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const alert = await this.alertService.setAlertThreshold(req.body);
      res.status(201).json({ success: true, data: alert });
    } catch (error: unknown) {
      next(error);
    }
  };
}
