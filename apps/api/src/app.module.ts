import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './config/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { PlatformManagementModule } from './modules/platform-management/platform-management.module';
import { IdentityModule } from './modules/identity/identity.module';
import { DeviceIntelligenceModule } from './modules/device-intelligence/device-intelligence.module';
import { AccessSessionsModule } from './modules/access-sessions/access-sessions.module';
import { BackgroundChecksModule } from './modules/background-checks/background-checks.module';
import { TrustEngineModule } from './modules/trust-engine/trust-engine.module';
import { RegistryModule } from './modules/registry/registry.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AdminDashboardModule } from './modules/admin-dashboard/admin-dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(__dirname, '../.env'),
        resolve(__dirname, '../../.env'),
        resolve(__dirname, '../../../../.env'),
      ],
    }),
    RedisModule,
    PrismaModule,
    PlatformManagementModule,
    IdentityModule,
    DeviceIntelligenceModule,
    AccessSessionsModule,
    BackgroundChecksModule,
    TrustEngineModule,
    RegistryModule,
    ComplianceModule,
    AdminDashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
