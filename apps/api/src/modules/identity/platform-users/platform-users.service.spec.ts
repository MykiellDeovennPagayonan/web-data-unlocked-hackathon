import { Test, TestingModule } from '@nestjs/testing';
import { PlatformUsersService } from './platform-users.service';
import { PlatformUsersRepository } from './platform-users.repository';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';

describe('PlatformUsersService', () => {
  let service: PlatformUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformUsersService,
        { provide: PlatformUsersRepository, useValue: {} },
        { provide: AuditLogsService, useValue: { logAction: jest.fn() } },
      ],
    }).compile();

    service = module.get<PlatformUsersService>(PlatformUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
