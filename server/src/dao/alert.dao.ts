import { Alert, PrismaClient } from '@prisma/client';

export class AlertDao {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(filters?: { resolved?: boolean; type?: string; severity?: string }): Promise<Alert[]> {
    const where: Record<string, unknown> = {};
    if (filters?.resolved !== undefined) where.isResolved = filters.resolved;
    if (filters?.type) where.type = filters.type;
    if (filters?.severity) where.severity = filters.severity;
    return this.prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  findById(id: string): Promise<Alert | null> {
    return this.prisma.alert.findUnique({ where: { id } });
  }

  create(data: { meterId: string; type: 'WATER' | 'ELECTRICITY'; message: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }): Promise<Alert> {
    return this.prisma.alert.create({ data });
  }

  resolve(id: string): Promise<Alert> {
    return this.prisma.alert.update({ where: { id }, data: { isResolved: true } });
  }
}
