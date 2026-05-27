import { Module } from '@nestjs/common';
import { PlatformUsersController } from './platform-users.controller';
import { PlatformUsersService } from './platform-users.service';
import { PlatformUsersRepository } from './platform-users.repository';
import { PlatformManagementModule } from '../../platform-management/platform-management.module';

@Module({
  imports: [PlatformManagementModule],
  controllers: [PlatformUsersController],
  providers: [PlatformUsersService, PlatformUsersRepository],
  exports: [PlatformUsersService, PlatformUsersRepository],
})
export class PlatformUsersModule {}
