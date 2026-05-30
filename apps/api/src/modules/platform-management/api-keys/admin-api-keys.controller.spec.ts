import { Test, TestingModule } from '@nestjs/testing';
import { AdminApiKeysController } from './admin-api-keys.controller';
import { ApiKeysService } from './api-keys.service';

describe('AdminApiKeysController', () => {
  let controller: AdminApiKeysController;
  let service: jest.Mocked<ApiKeysService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminApiKeysController],
      providers: [
        {
          provide: ApiKeysService,
          useValue: {
            listApiKeysByPlatform: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminApiKeysController>(AdminApiKeysController);
    service = module.get(ApiKeysService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/api-keys/platforms/:platformId', () => {
    it('returns a list of API keys for the platform', async () => {
      const mockResult = [
        {
          id: '1',
          name: 'Test Key',
          scopes: ['read'],
          createdAt: new Date(),
          expiresAt: null,
          revokedAt: null,
          lastUsedAt: null,
        },
      ];
      service.listApiKeysByPlatform.mockResolvedValue(mockResult as any);

      const result = await controller.listApiKeysByPlatform('platform-1');

      expect(service.listApiKeysByPlatform).toHaveBeenCalledWith('platform-1');
      expect(result).toEqual(mockResult);
    });

    it('returns empty array when service returns empty', async () => {
      service.listApiKeysByPlatform.mockResolvedValue([]);

      const result = await controller.listApiKeysByPlatform('unknown-platform');

      expect(service.listApiKeysByPlatform).toHaveBeenCalledWith(
        'unknown-platform',
      );
      expect(result).toEqual([]);
    });
  });
});
