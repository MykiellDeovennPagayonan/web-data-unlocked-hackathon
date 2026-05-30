import { ConflictException } from '@nestjs/common';
import { IdentitiesRepository } from '../identities.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { hashEmail } from '../../../../common/crypto/hash';
import { CreateIdentityData, Identity } from '../entities/identity.entity';

export async function createIdentity(
  repository: IdentitiesRepository,
  auditLogsService: AuditLogsService,
  input: CreateIdentityData,
): Promise<Identity> {
  const emailHash = hashEmail(input.email);
  const existing = await repository.findByEmailHash(emailHash);
  if (existing) {
    throw new ConflictException('Identity already exists');
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
