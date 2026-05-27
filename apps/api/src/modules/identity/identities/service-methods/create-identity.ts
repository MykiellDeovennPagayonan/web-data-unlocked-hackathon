import { IdentitiesRepository } from '../identities.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { CreateIdentityData, Identity } from '../entities/identity.entity';

export async function createIdentity(
  repository: IdentitiesRepository,
  auditLogsService: AuditLogsService,
  input: CreateIdentityData,
): Promise<Identity> {
  const existing = await repository.findByEmailHash(input.emailHash);
  if (existing) {
    throw new Error('Identity already exists');
  }
  const identity = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'identity_created',
    targetType: 'identity',
    targetId: identity.id,
    newValue: {
      trustStatus: identity.trustStatus,
      isHumanVerified: identity.isHumanVerified,
    },
  });

  return identity;
}
