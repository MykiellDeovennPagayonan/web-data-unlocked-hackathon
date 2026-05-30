import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let service: jest.Mocked<OrganizationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [
        {
          provide: OrganizationsService,
          useValue: {
            listOrganizations: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
    service = module.get(OrganizationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /admin/organizations', () => {
    it('returns a list of organizations', async () => {
      const mockResult = [
        { id: '1', legalName: 'Test Org', domain: 'test.local' },
      ];
      service.listOrganizations.mockResolvedValue(mockResult as any);

      const result = await controller.listOrganizations();

      expect(service.listOrganizations).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('passes parsed take and skip to service', async () => {
      service.listOrganizations.mockResolvedValue([]);

      await controller.listOrganizations('10', '5');

      expect(service.listOrganizations).toHaveBeenCalledWith(10, 5);
    });

    it('handles non-numeric query params gracefully', async () => {
      service.listOrganizations.mockResolvedValue([]);

      await controller.listOrganizations('abc', 'xyz');

      expect(service.listOrganizations).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });
});
