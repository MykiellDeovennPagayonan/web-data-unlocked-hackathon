import { rotateApiKey } from './rotate-api-key';
import { ApiKeysRepository } from '../api-keys.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';

describe('rotateApiKey', () => {
  let repository: jest.Mocked<ApiKeysRepository>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      update: jest.fn(),
      insert: jest.fn(),
    } as unknown as jest.Mocked<ApiKeysRepository>;

    auditLogsService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditLogsService>;
  });

  it('should rotate an existing API key', async () => {
    const oldKey = {
      id: 'old-key-1',
      name: 'Old Key',
      revokedAt: null,
    } as any;

    const revokedKey = {
      id: 'old-key-1',
      name: 'Old Key',
      revokedAt: new Date(),
    } as any;

    const newKey = {
      id: 'new-key-1',
      name: 'New Key',
      platformId: 'platform-1',
      scopes: ['read'],
      createdAt: new Date(),
      expiresAt: null,
      revokedAt: null,
      lastUsedAt: null,
    } as any;

    repository.findById.mockResolvedValue(oldKey);
    repository.update.mockResolvedValueOnce(revokedKey);
    repository.insert.mockResolvedValue(newKey);

    const result = await rotateApiKey(
      repository,
      auditLogsService,
      'old-key-1',
      {
        platformId: 'platform-1',
        name: 'New Key',
        scopes: ['read'],
      },
    );

    expect(result.apiKey).toBeDefined();
    expect(result.rawKey).toBeDefined();
    expect(repository.findById).toHaveBeenCalledWith('old-key-1');
    expect(repository.update).toHaveBeenCalledWith('old-key-1', {
      revokedAt: expect.any(Date),
    });
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        platformId: 'platform-1',
        name: 'New Key',
        scopes: ['read'],
        keyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
    expect(auditLogsService.logAction).toHaveBeenCalled();
  });

  it('should throw a clear error when the old API key does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      rotateApiKey(repository, auditLogsService, 'non-existent-key', {
        platformId: 'platform-1',
        name: 'New Key',
        scopes: [],
      }),
    ).rejects.toThrow('API key not found: non-existent-key');

    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.insert).not.toHaveBeenCalled();
    expect(auditLogsService.logAction).not.toHaveBeenCalled();
  });
});
