import { Test, TestingModule } from '@nestjs/testing';
import { TrustCertificatesController } from './trust-certificates.controller';
import { TrustCertificatesService } from './trust-certificates.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('TrustCertificatesController', () => {
  let controller: TrustCertificatesController;
  let service: jest.Mocked<TrustCertificatesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrustCertificatesController],
      providers: [
        {
          provide: TrustCertificatesService,
          useValue: {
            listCertificates: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TrustCertificatesController>(
      TrustCertificatesController,
    );
    service = module.get(TrustCertificatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/trust-certificates', () => {
    it('returns a list of certificates', async () => {
      const mockResult = [
        { id: '1', certificateHash: 'hash-1', status: 'active' },
      ];
      service.listCertificates.mockResolvedValue(mockResult as any);

      const result = await controller.listAdmin();

      expect(service.listCertificates).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('passes parsed take and skip to service', async () => {
      service.listCertificates.mockResolvedValue([]);

      await controller.listAdmin('10', '5');

      expect(service.listCertificates).toHaveBeenCalledWith(10, 5);
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listCertificates.mockResolvedValue([]);

      await controller.listAdmin('abc', 'xyz');

      expect(service.listCertificates).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });
});
