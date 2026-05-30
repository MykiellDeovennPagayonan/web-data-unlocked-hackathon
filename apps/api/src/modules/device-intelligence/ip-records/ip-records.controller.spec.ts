import { Test, TestingModule } from '@nestjs/testing';
import { IpRecordsController } from './ip-records.controller';
import { IpRecordsService } from './ip-records.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('IpRecordsController', () => {
  let controller: IpRecordsController;
  let service: jest.Mocked<IpRecordsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpRecordsController],
      providers: [
        {
          provide: IpRecordsService,
          useValue: {
            listIpRecords: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<IpRecordsController>(IpRecordsController);
    service = module.get(IpRecordsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/ip-records', () => {
    it('returns a list of IP records', async () => {
      const mockResult = [{ id: '1', ipAddress: '1.2.3.4', riskScore: 10 }];
      service.listIpRecords.mockResolvedValue(mockResult as any);

      const result = await controller.listIpRecords();

      expect(service.listIpRecords).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockResult);
    });

    it('passes parsed take and skip to service', async () => {
      service.listIpRecords.mockResolvedValue([]);

      await controller.listIpRecords('10', '5');

      expect(service.listIpRecords).toHaveBeenCalledWith(10, 5);
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listIpRecords.mockResolvedValue([]);

      await controller.listIpRecords('abc', 'xyz');

      expect(service.listIpRecords).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});
