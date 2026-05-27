import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustEngineModule } from '../trust-engine/trust-engine.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { RegistryEntriesController } from './registry-entries/registry-entries.controller';
import { RegistryEntriesService } from './registry-entries/registry-entries.service';
import { RegistryEntriesRepository } from './registry-entries/registry-entries.repository';
import { RegistryTargetsController } from './registry-targets/registry-targets.controller';
import { RegistryTargetsService } from './registry-targets/registry-targets.service';
import { RegistryTargetsRepository } from './registry-targets/registry-targets.repository';
import { CommunityReportsController } from './community-reports/community-reports.controller';
import { CommunityReportsService } from './community-reports/community-reports.service';
import { CommunityReportsRepository } from './community-reports/community-reports.repository';

@Module({
  imports: [TrustEngineModule, ComplianceModule],
  controllers: [
    RegistryEntriesController,
    RegistryTargetsController,
    CommunityReportsController,
  ],
  providers: [
    PrismaService,
    RegistryEntriesService,
    RegistryEntriesRepository,
    RegistryTargetsService,
    RegistryTargetsRepository,
    CommunityReportsService,
    CommunityReportsRepository,
  ],
  exports: [
    RegistryEntriesService,
    RegistryTargetsService,
    CommunityReportsService,
  ],
})
export class RegistryModule {}
