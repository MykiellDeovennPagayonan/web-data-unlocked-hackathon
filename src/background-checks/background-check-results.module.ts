import { Module } from '@nestjs/common';
import { BackgroundChecksController } from './background-checks.controller';
import { BackgroundCheckResultsController } from './background-check-results.controller';
import { BackgroundChecksService } from './background-checks.service';
import { BackgroundCheckResultsService } from './background-check-results.service';

@Module({
  controllers: [BackgroundChecksController, BackgroundCheckResultsController],
  providers: [BackgroundChecksService, BackgroundCheckResultsService]
})
export class BackgroundCheckResultsModule {}
