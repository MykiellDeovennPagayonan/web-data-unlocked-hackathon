import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustEngineModule } from '../trust-engine/trust-engine.module';
import { BackgroundChecksController } from './background-checks/background-checks.controller';
import { BackgroundChecksService } from './background-checks/background-checks.service';
import { BackgroundChecksRepository } from './background-checks/background-checks.repository';
import { BackgroundCheckResultsController } from './background-check-results/background-check-results.controller';
import { BackgroundCheckResultsService } from './background-check-results/background-check-results.service';
import { BackgroundCheckResultsRepository } from './background-check-results/background-check-results.repository';

@Module({
  imports: [TrustEngineModule],
  controllers: [BackgroundChecksController, BackgroundCheckResultsController],
  providers: [
    PrismaService,
    BackgroundChecksService,
    BackgroundChecksRepository,
    BackgroundCheckResultsService,
    BackgroundCheckResultsRepository,
  ],
  exports: [BackgroundChecksService, BackgroundCheckResultsService],
})
export class BackgroundChecksModule {}
