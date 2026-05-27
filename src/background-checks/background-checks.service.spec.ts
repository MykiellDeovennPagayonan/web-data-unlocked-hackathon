import { Test, TestingModule } from '@nestjs/testing';
import { BackgroundChecksService } from './background-checks.service';

describe('BackgroundChecksService', () => {
  let service: BackgroundChecksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackgroundChecksService],
    }).compile();

    service = module.get<BackgroundChecksService>(BackgroundChecksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
