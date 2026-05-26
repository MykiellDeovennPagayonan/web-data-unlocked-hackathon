import { Module } from '@nestjs/common';
import { PlatformUsersController } from '../platform-users.controller';
import { PlatformUsersService } from '../platform-users.service';
import { PlatformUsersRepository } from './platform-users.repository';

@Module({
  controllers: [PlatformUsersController],
  providers: [PlatformUsersService, PlatformUsersRepository],
  exports: [PlatformUsersService, PlatformUsersRepository],
})
export class PlatformUsersModule {}
