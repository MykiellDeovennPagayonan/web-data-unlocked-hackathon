import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: jest.Mocked<WebhooksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: {
            listAllWebhookLogs: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WebhooksController>(WebhooksController);
    service = module.get(WebhooksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/webhooks/logs', () => {
    it('returns a list of webhook logs', async () => {
      const mockResult = [
        { id: '1', eventType: 'access.event.created', responseStatus: 200 },
      ];
      service.listAllWebhookLogs.mockResolvedValue(mockResult as any);

      const result = await controller.listAdminWebhookLogs();

      expect(service.listAllWebhookLogs).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('passes parsed take and skip to service', async () => {
      service.listAllWebhookLogs.mockResolvedValue([]);

      await controller.listAdminWebhookLogs('10', '5');

      expect(service.listAllWebhookLogs).toHaveBeenCalledWith(10, 5);
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listAllWebhookLogs.mockResolvedValue([]);

      await controller.listAdminWebhookLogs('abc', 'xyz');

      expect(service.listAllWebhookLogs).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });
});
