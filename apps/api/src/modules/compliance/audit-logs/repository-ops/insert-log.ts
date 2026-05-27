import { PrismaService } from '../../../../prisma/prisma.service';
import { AuditLog, CreateAuditLogData } from '../entities/audit-log.entity';

export async function insertLog(
  prisma: PrismaService,
  data: CreateAuditLogData,
): Promise<AuditLog> {
  return prisma.auditLog.create({
    data: {
      actorType: data.actorType,
      actorId: data.actorId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      oldValue: data.oldValue,
      newValue: data.newValue,
    },
  });
}
