import { Test, TestingModule } from '@nestjs/testing';
import { VerificationRequestsController } from './verification-requests.controller';
import { VerificationRequestsService } from './verification-requests.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('VerificationRequestsController', () => {
  let controller: VerificationRequestsController;
  let service: jest.Mocked<VerificationRequestsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerificationRequestsController],
      providers: [
        {
          provide: VerificationRequestsService,
          useValue: {
            listRequests: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<VerificationRequestsController>(
      VerificationRequestsController,
    );
    service = module.get(VerificationRequestsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/compliance/verification-requests', () => {
    it('returns a list of verification requests', async () => {
      const mockResult = [
        { id: '1', verificationType: 'email', status: 'pending' },
      ];
      service.listRequests.mockResolvedValue(mockResult as any);

      const result = await controller.listAdmin();

      expect(service.listRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: undefined,
          offset: undefined,
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it('passes parsed limit and offset to service', async () => {
      service.listRequests.mockResolvedValue([]);

      await controller.listAdmin(
        undefined,
        undefined,
        undefined,
        undefined,
        '10',
        '5',
      );

      expect(service.listRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 5,
        }),
      );
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listRequests.mockResolvedValue([]);

      await controller.listAdmin(
        undefined,
        undefined,
        undefined,
        undefined,
        'abc',
        'xyz',
      );

      expect(service.listRequests).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: undefined,
          offset: undefined,
        }),
      );
    });
  });
});
