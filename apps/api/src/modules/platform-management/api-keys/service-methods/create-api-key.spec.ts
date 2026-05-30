import { createApiKey } from './create-api-key';
import { ApiKeysRepository } from '../api-keys.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';

describe('createApiKey', () => {
  let repository: jest.Mocked<ApiKeysRepository>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  beforeEach(() => {
    repository = {
      insert: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ApiKeysRepository>;

    auditLogsService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditLogsService>;
  });

  it('should create an API key with the hash in the initial insert', async () => {
    const insertedKey = {
      id: 'key-1',
      name: 'Test Key',
      platformId: 'platform-1',
      scopes: ['read'],
      keyHash: '',
      createdAt: new Date(),
      expiresAt: null,
      revokedAt: null,
      lastUsedAt: null,
    } as any;

    repository.insert.mockImplementation((data) =>
      Promise.resolve({
        ...insertedKey,
        keyHash: data.keyHash ?? insertedKey.keyHash,
      }),
    );

    const result = await createApiKey(
      repository,
      auditLogsService,
      'platform-1',
      {
        platformId: 'platform-1',
        name: 'Test Key',
        scopes: ['read'],
      },
    );

    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        platformId: 'platform-1',
        name: 'Test Key',
        scopes: ['read'],
        keyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(repository.update).not.toHaveBeenCalled();
    expect(result.apiKey.keyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.rawKey).toMatch(/^tl_[a-f0-9]{64}$/);
  });

  it('should log the creation audit', async () => {
    repository.insert.mockResolvedValue({
      id: 'key-1',
      name: 'Test Key',
    } as any);

    await createApiKey(
      repository,
      auditLogsService,
      'platform-1',
      {
        platformId: 'platform-1',
        name: 'Test Key',
        scopes: ['read'],
      },
      { actorType: 'admin', actorId: 'admin-1' },
    );

    expect(auditLogsService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'api_key_created',
        actorType: 'admin',
        actorId: 'admin-1',
        targetType: 'api_key',
        targetId: 'key-1',
      }),
    );
  });
});
