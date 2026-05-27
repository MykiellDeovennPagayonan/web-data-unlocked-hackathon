import { Test, TestingModule } from '@nestjs/testing';
import { EntityAliasesController } from './entity-aliases.controller';
import { EntityAliasesService } from './entity-aliases.service';

describe('EntityAliasesController', () => {
  let controller: EntityAliasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntityAliasesController],
      providers: [{ provide: EntityAliasesService, useValue: {} }],
    }).compile();

    controller = module.get<EntityAliasesController>(EntityAliasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
