import { validateApiKey } from './validate-api-key';
import { ApiKeysRepository } from '../api-keys.repository';

describe('validateApiKey', () => {
  let repository: jest.Mocked<ApiKeysRepository>;

  beforeEach(() => {
    repository = {
      findByHash: jest.fn(),
    } as unknown as jest.Mocked<ApiKeysRepository>;
  });

  it('should return null when the key is revoked', async () => {
    repository.findByHash.mockResolvedValue({
      id: 'key-1',
      revokedAt: new Date(),
    } as any);

    const result = await validateApiKey(repository, 'hash-1');
    expect(result).toBeNull();
  });

  it('should return null when the key has already expired', async () => {
    repository.findByHash.mockResolvedValue({
      id: 'key-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() - 1000),
    } as any);

    const result = await validateApiKey(repository, 'hash-1');
    expect(result).toBeNull();
  });

  it('should return null when expiresAt equals the exact current time', async () => {
    const now = new Date();
    repository.findByHash.mockResolvedValue({
      id: 'key-1',
      revokedAt: null,
      expiresAt: now,
    } as any);

    const result = await validateApiKey(repository, 'hash-1');
    expect(result).toBeNull();
  });

  it('should return the key when it is still valid', async () => {
    const validKey = {
      id: 'key-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000),
    } as any;

    repository.findByHash.mockResolvedValue(validKey);

    const result = await validateApiKey(repository, 'hash-1');
    expect(result).toEqual(validKey);
  });
});
