import { Test, TestingModule } from '@nestjs/testing';
import { PlatformUsersService } from './platform-users.service';

describe('PlatformUsersService', () => {
  let service: PlatformUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatformUsersService],
    }).compile();

    service = module.get<PlatformUsersService>(PlatformUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
