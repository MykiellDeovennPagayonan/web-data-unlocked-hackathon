import { BackgroundChecksRepository } from '../background-checks.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  BackgroundCheck,
  CreateBackgroundCheckData,
} from '../entities/background-check.entity';

export async function createBackgroundCheck(
  repository: BackgroundChecksRepository,
  auditLogsService: AuditLogsService,
  input: CreateBackgroundCheckData,
): Promise<BackgroundCheck> {
  const check = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'background_check_created',
    targetType: 'background_check',
    targetId: check.id,
    newValue: {
      entityType: check.entityType,
      identityId: check.identityId,
      orgId: check.orgId,
    },
  });

  return check;
}
