import { Test, TestingModule } from '@nestjs/testing';
import { CommunityReportsController } from './community-reports.controller';
import { CommunityReportsService } from './community-reports.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('CommunityReportsController', () => {
  let controller: CommunityReportsController;
  let service: jest.Mocked<CommunityReportsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityReportsController],
      providers: [
        {
          provide: CommunityReportsService,
          useValue: {
            listReports: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommunityReportsController>(
      CommunityReportsController,
    );
    service = module.get(CommunityReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/community-reports', () => {
    it('returns a list of community reports', async () => {
      const mockResult = [{ id: '1', category: 'fraud', status: 'pending' }];
      service.listReports.mockResolvedValue(mockResult as any);

      const result = await controller.listAdmin();

      expect(service.listReports).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: undefined,
          offset: undefined,
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it('passes parsed limit and offset to service', async () => {
      service.listReports.mockResolvedValue([]);

      await controller.listAdmin(undefined, undefined, undefined, '10', '5');

      expect(service.listReports).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 5,
        }),
      );
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listReports.mockResolvedValue([]);

      await controller.listAdmin(undefined, undefined, undefined, 'abc', 'xyz');

      expect(service.listReports).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: undefined,
          offset: undefined,
        }),
      );
    });
  });
});
