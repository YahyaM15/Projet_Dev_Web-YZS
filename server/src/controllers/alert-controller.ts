import { NextFunction, Request, Response } from 'express';
import { AlertService } from '../services/alert.service';

export class AlertController {
  public constructor(private readonly alertService: AlertService) {}

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as { resolved?: string; type?: string; severity?: string };
      const alerts = await this.alertService.getAll(filters);
      res.json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  };

  public resolve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await this.alertService.resolve(String(req.params.id));
      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  };

  public setThreshold = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.alertService.setThreshold(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
