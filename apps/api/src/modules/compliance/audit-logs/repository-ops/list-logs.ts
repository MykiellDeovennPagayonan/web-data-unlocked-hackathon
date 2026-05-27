import { PrismaService } from '../../../../prisma/prisma.service';
import { AuditLog, AuditLogFilters } from '../entities/audit-log.entity';

export async function listLogs(
  prisma: PrismaService,
  filters: AuditLogFilters,
): Promise<AuditLog[]> {
  return prisma.auditLog.findMany({
    where: {
      actorType: filters.actorType,
      actorId: filters.actorId,
      action: filters.action,
      targetType: filters.targetType,
      targetId: filters.targetId,
      createdAt: {
        gte: filters.from,
        lte: filters.to,
      },
    },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}
