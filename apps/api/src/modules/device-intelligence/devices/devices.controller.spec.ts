import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('DevicesController', () => {
  let controller: DevicesController;
  let service: jest.Mocked<DevicesService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DevicesService,
          useValue: {
            listDevices: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DevicesController>(DevicesController);
    service = module.get(DevicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/devices', () => {
    it('returns a list of devices', async () => {
      const mockResult = [{ id: '1', stableHash: 'hash-1', riskScore: 42 }];
      service.listDevices.mockResolvedValue(mockResult as any);

      const result = await controller.listDevices();

      expect(service.listDevices).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockResult);
    });

    it('passes parsed take and skip to service', async () => {
      service.listDevices.mockResolvedValue([]);

      await controller.listDevices('10', '5');

      expect(service.listDevices).toHaveBeenCalledWith(10, 5);
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listDevices.mockResolvedValue([]);

      await controller.listDevices('abc', 'xyz');

      expect(service.listDevices).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});
