import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';

describe('ApiKeysController', () => {
  let controller: ApiKeysController;
  let service: jest.Mocked<ApiKeysService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
      providers: [
        {
          provide: ApiKeysService,
          useValue: {
            createApiKey: jest.fn(),
            listApiKeysByPlatform: jest.fn(),
            revokeApiKey: jest.fn(),
            rotateApiKey: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ApiKeysController>(ApiKeysController);
    service = module.get(ApiKeysService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('DELETE :id', () => {
    it('should require an API key to revoke', () => {
      // This test verifies the decorator metadata; in practice
      // NestJS would reject the request before reaching the controller method.

      /* eslint-disable @typescript-eslint/unbound-method */
      const guards = Reflect.getMetadata(
        '__guards__',
        ApiKeysController.prototype.revokeApiKey,
      );
      /* eslint-enable @typescript-eslint/unbound-method */

      // The method should have the ApiKeyGuard applied
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
    });

    it('should revoke the API key when authenticated', async () => {
      const mockKey = {
        id: 'key-1',
        name: 'Test Key',
        scopes: ['read'],
        createdAt: new Date(),
        expiresAt: null,
        revokedAt: new Date(),
        lastUsedAt: null,
      } as any;

      service.revokeApiKey.mockResolvedValue(mockKey);

      const result = await controller.revokeApiKey('key-1');

      expect(service.revokeApiKey).toHaveBeenCalledWith('key-1');
      expect(result.id).toBe('key-1');
      expect(result.revokedAt).not.toBeNull();
    });
  });
});
