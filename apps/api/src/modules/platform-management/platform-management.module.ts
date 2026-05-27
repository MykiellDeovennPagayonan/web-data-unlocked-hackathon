import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ComplianceModule } from '../compliance/compliance.module';
import { PlatformsController } from './platforms/platforms.controller';
import { PlatformsService } from './platforms/platforms.service';
import { PlatformsRepository } from './platforms/platforms.repository';
import { ApiKeysController } from './api-keys/api-keys.controller';
import { ApiKeysService } from './api-keys/api-keys.service';
import { ApiKeysRepository } from './api-keys/api-keys.repository';
import { PlatformRulesController } from './platform-rules/platform-rules.controller';
import { PlatformRulesService } from './platform-rules/platform-rules.service';
import { PlatformRulesRepository } from './platform-rules/platform-rules.repository';
import { WebhooksController } from './webhooks/webhooks.controller';
import { WebhooksService } from './webhooks/webhooks.service';
import { WebhooksRepository } from './webhooks/webhooks.repository';

@Global()
@Module({
  imports: [ComplianceModule],
  controllers: [
    PlatformsController,
    ApiKeysController,
    PlatformRulesController,
    WebhooksController,
  ],
  providers: [
    PrismaService,
    PlatformsService,
    PlatformsRepository,
    ApiKeysService,
    ApiKeysRepository,
    PlatformRulesService,
    PlatformRulesRepository,
    WebhooksService,
    WebhooksRepository,
  ],
  exports: [
    PlatformsService,
    ApiKeysService,
    PlatformRulesService,
    WebhooksService,
  ],
})
export class PlatformManagementModule {}
