import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlatformManagementModule } from './modules/platform-management/platform-management.module';
import { IdentityModule } from './modules/identity/identity.module';
import { DeviceIntelligenceModule } from './modules/device-intelligence/device-intelligence.module';
import { AccessSessionsModule } from './modules/access-sessions/access-sessions.module';
import { BackgroundChecksModule } from './modules/background-checks/background-checks.module';
import { TrustEngineModule } from './modules/trust-engine/trust-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    PlatformManagementModule,
    IdentityModule,
    DeviceIntelligenceModule,
    AccessSessionsModule,
    BackgroundChecksModule,
    TrustEngineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
