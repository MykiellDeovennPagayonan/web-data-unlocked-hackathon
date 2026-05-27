import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundChecksController } from './background-checks.controller';

describe('BackgroundChecksController', () => {
  let controller: BackgroundChecksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackgroundChecksController],
    }).compile();

    controller = module.get<BackgroundChecksController>(BackgroundChecksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
