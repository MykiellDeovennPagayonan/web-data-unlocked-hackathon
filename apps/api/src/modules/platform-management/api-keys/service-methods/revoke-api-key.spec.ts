import { revokeApiKey } from './revoke-api-key';
import { ApiKeysRepository } from '../api-keys.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';

describe('revokeApiKey', () => {
  let repository: jest.Mocked<ApiKeysRepository>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<ApiKeysRepository>;

    auditLogsService = {
      logAction: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuditLogsService>;
  });

  it('should revoke an existing API key', async () => {
    const existingKey = {
      id: 'key-1',
      name: 'Test Key',
      revokedAt: null,
    } as any;

    const revokedKey = {
      id: 'key-1',
      name: 'Test Key',
      revokedAt: new Date(),
    } as any;

    repository.findById.mockResolvedValue(existingKey);
    repository.update.mockResolvedValue(revokedKey);

    const result = await revokeApiKey(repository, auditLogsService, 'key-1');

    expect(result).toEqual(revokedKey);
    expect(repository.findById).toHaveBeenCalledWith('key-1');
    expect(repository.update).toHaveBeenCalledWith('key-1', {
      revokedAt: expect.any(Date),
    });
    expect(auditLogsService.logAction).toHaveBeenCalled();
  });

  it('should throw a clear error when the API key does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      revokeApiKey(repository, auditLogsService, 'non-existent-key'),
    ).rejects.toThrow('API key not found: non-existent-key');

    expect(repository.update).not.toHaveBeenCalled();
    expect(auditLogsService.logAction).not.toHaveBeenCalled();
  });
});
