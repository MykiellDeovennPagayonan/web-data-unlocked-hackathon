import { Test, TestingModule } from '@nestjs/testing';
import { PlatformUsersController } from './platform-users.controller';
import { PlatformUsersService } from './platform-users.service';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';

describe('PlatformUsersController', () => {
  let controller: PlatformUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatformUsersController],
      providers: [{ provide: PlatformUsersService, useValue: {} }],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PlatformUsersController>(PlatformUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
