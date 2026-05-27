import { Injectable } from '@nestjs/common';
import { AuditLogsRepository } from './audit-logs.repository';
import { logAction } from './service-methods/log-action';
import { listAuditLogs } from './service-methods/list-audit-logs';
import {
  AuditLog,
  CreateAuditLogData,
  AuditLogFilters,
} from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(private readonly repository: AuditLogsRepository) {}

  logAction = (input: CreateAuditLogData): Promise<AuditLog> =>
    logAction(this.repository, input);

  listAuditLogs = (filters: AuditLogFilters): Promise<AuditLog[]> =>
    listAuditLogs(this.repository, filters);
}
