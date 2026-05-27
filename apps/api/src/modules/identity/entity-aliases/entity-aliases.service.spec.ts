import { Test, TestingModule } from '@nestjs/testing';
import { EntityAliasesService } from './entity-aliases.service';

describe('EntityAliasesService', () => {
  let service: EntityAliasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntityAliasesService],
    }).compile();

    service = module.get<EntityAliasesService>(EntityAliasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
