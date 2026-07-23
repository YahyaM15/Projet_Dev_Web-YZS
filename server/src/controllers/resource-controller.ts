import { NextFunction, Request, Response } from 'express';
import { ResourceService } from '../services/resource.service';

export class ResourceController {
  public constructor(private readonly resourceService: ResourceService) {}

  public getAllCounters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counters = await this.resourceService.getAllCounters();
      res.json({ success: true, data: counters });
    } catch (error) {
      next(error);
    }
  };

  public getCounterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counter = await this.resourceService.getCounterById(String(req.params.counterId));
      if (!counter) { res.status(404).json({ success: false, message: 'Counter not found.' }); return; }
      res.json({ success: true, data: counter });
    } catch (error) {
      next(error);
    }
  };

  public createCounter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counter = await this.resourceService.createCounter({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: counter });
    } catch (error) {
      next(error);
    }
  };

  public updateCounter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counter = await this.resourceService.updateCounter(String(req.params.counterId), req.body);
      res.json({ success: true, data: counter });
    } catch (error) {
      next(error);
    }
  };

  public getConsumptionStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.resourceService.getStats(String(req.params.counterId));
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
}
