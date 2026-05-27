import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundCheckResultsController } from './background-check-results.controller';

describe('BackgroundCheckResultsController', () => {
  let controller: BackgroundCheckResultsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BackgroundCheckResultsController],
    }).compile();

    controller = module.get<BackgroundCheckResultsController>(BackgroundCheckResultsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
