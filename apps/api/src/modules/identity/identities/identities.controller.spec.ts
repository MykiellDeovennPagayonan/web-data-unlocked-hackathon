import { Test, TestingModule } from '@nestjs/testing';
import { IdentitiesController } from './identities.controller';
import { IdentitiesService } from './identities.service';

describe('IdentitiesController', () => {
  let controller: IdentitiesController;
  let service: jest.Mocked<IdentitiesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdentitiesController],
      providers: [
        {
          provide: IdentitiesService,
          useValue: {
            listIdentities: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IdentitiesController>(IdentitiesController);
    service = module.get(IdentitiesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/identities', () => {
    it('returns a list of identities without pagination params', async () => {
      const mockResult = [
        {
          id: '1',
          emailHash: 'hash-1',
          encryptedEmail: 'test@example.com',
          trustStatus: 'verified',
          createdAt: new Date(),
        },
      ];
      service.listIdentities.mockResolvedValue(mockResult as any);

      const result = await controller.listIdentities();

      expect(service.listIdentities).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockResult);
    });

    it('passes parsed take and skip to service', async () => {
      service.listIdentities.mockResolvedValue([]);

      await controller.listIdentities('10', '5');

      expect(service.listIdentities).toHaveBeenCalledWith(10, 5);
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listIdentities.mockResolvedValue([]);

      await controller.listIdentities('abc', 'xyz');

      expect(service.listIdentities).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});
