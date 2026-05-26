import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlatformManagementModule } from './modules/platform-management/platform-management.module';

@Module({
  imports: [PrismaModule, PlatformManagementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
