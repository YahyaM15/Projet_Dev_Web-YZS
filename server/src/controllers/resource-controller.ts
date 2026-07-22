import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../errors/http-error';
import { CreateCounterInput, RecordIndexInput } from '../schemas/resource-schema';
import { ResourceService } from '../services/resource.service';

const getAuthenticatedUserId = (req: Request): string => {
  if (req.user === undefined) {
    throw new HttpError(401, 'Authentication required.');
  }

  return req.user.userId;
};

export class ResourceController {
  public constructor(private readonly resourceService: ResourceService) {}

  public getAllCounters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counters = await this.resourceService.getAllCounters(getAuthenticatedUserId(req));
      res.json({ success: true, data: counters });
    } catch (error: unknown) {
      next(error);
    }
  };

  public getCounterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const counter = await this.resourceService.getCounterById(
        req.params.counterId as string,
        getAuthenticatedUserId(req),
      );
      res.json({ success: true, data: counter });
    } catch (error: unknown) {
      next(error);
    }
  };

  public createCounter = async (
    req: Request<Record<string, string>, unknown, CreateCounterInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const counter = await this.resourceService.createCounter(getAuthenticatedUserId(req), req.body);
      res.status(201).json({ success: true, data: counter });
    } catch (error: unknown) {
      next(error);
    }
  };

  public recordMetric = async (
    req: Request<Record<string, string>, unknown, RecordIndexInput>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.resourceService.recordMetric(getAuthenticatedUserId(req), req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: unknown) {
      next(error);
    }
  };

  public getConsumptionStats = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const stats = await this.resourceService.getConsumptionStats(
        req.params.counterId as string,
        getAuthenticatedUserId(req),
      );
      res.json({ success: true, data: stats });
    } catch (error: unknown) {
      next(error);
    }
  };
}
