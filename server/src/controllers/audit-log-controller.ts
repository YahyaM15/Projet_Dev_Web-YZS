import { NextFunction, Request, Response } from 'express';
import { AuditLogDao } from '../dao/audit-log.dao';

export class AuditLogController {
  public constructor(private readonly auditLogDao: AuditLogDao) {}

  public getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.auditLogDao.findAll();
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  };
}
