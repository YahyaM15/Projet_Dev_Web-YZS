import { AuditLog, PrismaClient } from '@prisma/client';

export class AuditLogDao {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: { action: string; userId?: string; email?: string; ipAddress: string; details?: string }): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data: data as any });
  }
}
