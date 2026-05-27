import { AuditLogsRepository } from '../audit-logs.repository';
import { AuditLog, AuditLogFilters } from '../entities/audit-log.entity';

export async function listAuditLogs(
  repository: AuditLogsRepository,
  filters: AuditLogFilters,
): Promise<AuditLog[]> {
  return repository.list(filters);
}
