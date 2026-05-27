import { randomBytes, createHash } from 'crypto';
import { ApiKeysRepository } from '../api-keys.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { ApiKey, CreateApiKeyData } from '../entities/api-key.entity';

export interface CreateApiKeyResult {
  apiKey: ApiKey;
  rawKey: string;
}

export async function createApiKey(
  repository: ApiKeysRepository,
  auditLogsService: AuditLogsService,
  platformId: string,
  input: CreateApiKeyData,
): Promise<CreateApiKeyResult> {
  // Generate a secure random key
  const rawKey = `tl_${randomBytes(32).toString('hex')}`;
  const keyHash = createHash('sha256').update(rawKey).digest('hex');

  const apiKey = await repository.insert({
    platformId,
    name: input.name,
    scopes: input.scopes,
    expiresAt: input.expiresAt,
  });

  // Update with the hash after creation
  await repository.update(apiKey.id, { keyHash });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'api_key_created',
    targetType: 'api_key',
    targetId: apiKey.id,
    newValue: { platformId, name: input.name, scopes: input.scopes },
  });

  return { apiKey, rawKey };
}
