import { AuditLogsRepository } from '../audit-logs.repository';
import { AuditLog, CreateAuditLogData } from '../entities/audit-log.entity';

export async function logAction(
  repository: AuditLogsRepository,
  input: CreateAuditLogData,
): Promise<AuditLog> {
  return repository.insert(input);
}
