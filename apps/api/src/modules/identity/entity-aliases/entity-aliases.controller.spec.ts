import { Test, TestingModule } from '@nestjs/testing';
import { EntityAliasesController } from './entity-aliases.controller';

describe('EntityAliasesController', () => {
  let controller: EntityAliasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntityAliasesController],
    }).compile();

    controller = module.get<EntityAliasesController>(EntityAliasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
