import { Test, TestingModule } from '@nestjs/testing';
import { EntityAliasesService } from './entity-aliases.service';
import { EntityAliasesRepository } from './entity-aliases.repository';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';

describe('EntityAliasesService', () => {
  let service: EntityAliasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityAliasesService,
        { provide: EntityAliasesRepository, useValue: {} },
        { provide: AuditLogsService, useValue: { logAction: jest.fn() } },
      ],
    }).compile();

    service = module.get<EntityAliasesService>(EntityAliasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
