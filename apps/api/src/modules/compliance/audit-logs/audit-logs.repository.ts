import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertLog } from './repository-ops/insert-log';
import { listLogs } from './repository-ops/list-logs';
import {
  AuditLog,
  CreateAuditLogData,
  AuditLogFilters,
} from './entities/audit-log.entity';

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateAuditLogData): Promise<AuditLog> =>
    insertLog(this.prisma, data);

  list = (filters: AuditLogFilters): Promise<AuditLog[]> =>
    listLogs(this.prisma, filters);
}
