import { Test, TestingModule } from '@nestjs/testing';
import { IdentitiesService } from './identities.service';
import { IdentitiesRepository } from './identities.repository';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';

describe('IdentitiesService', () => {
  let service: IdentitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentitiesService,
        { provide: IdentitiesRepository, useValue: {} },
        { provide: AuditLogsService, useValue: { logAction: jest.fn() } },
      ],
    }).compile();

    service = module.get<IdentitiesService>(IdentitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
