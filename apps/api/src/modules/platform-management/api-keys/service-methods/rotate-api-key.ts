import { randomBytes, createHash } from 'crypto';
import { ApiKeysRepository } from '../api-keys.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { ApiKey, CreateApiKeyData } from '../entities/api-key.entity';

export interface RotateApiKeyResult {
  apiKey: ApiKey;
  rawKey: string;
}

export async function rotateApiKey(
  repository: ApiKeysRepository,
  auditLogsService: AuditLogsService,
  oldKeyId: string,
  newKeyData: CreateApiKeyData,
): Promise<RotateApiKeyResult> {
  // Revoke the old key
  const oldKey = await repository.update(oldKeyId, { revokedAt: new Date() });

  // Generate new key
  const rawKey = `tl_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const apiKey = await repository.insert({
    platformId: newKeyData.platformId,
    name: newKeyData.name,
    scopes: newKeyData.scopes,
    expiresAt: newKeyData.expiresAt,
  });

  // Update with the hash
  await repository.update(apiKey.id, { keyHash });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'api_key_rotated',
    targetType: 'api_key',
    targetId: oldKeyId,
    oldValue: { keyId: oldKeyId, revokedAt: null },
    newValue: {
      keyId: oldKeyId,
      revokedAt: oldKey.revokedAt,
      newKeyId: apiKey.id,
    },
  });

  return { apiKey, rawKey };
}
