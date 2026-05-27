import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundCheckResultsService } from './background-check-results.service';

describe('BackgroundCheckResultsService', () => {
  let service: BackgroundCheckResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackgroundCheckResultsService],
    }).compile();

    service = module.get<BackgroundCheckResultsService>(BackgroundCheckResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
