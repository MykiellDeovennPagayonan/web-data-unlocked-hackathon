import {
  AuditLog as PrismaAuditLog,
  AuditActorType,
} from '../../../../generated/client';

export type AuditLog = PrismaAuditLog;

export interface CreateAuditLogData {
  actorType: AuditActorType;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: object;
  newValue?: object;
}

export interface AuditLogFilters {
  actorType?: AuditActorType;
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}
