import { Module } from '@nestjs/common';
import { BackgroundCheckResultsModule } from './background-check-results.module';

@Module({
  imports: [BackgroundCheckResultsModule]
})
export class BackgroundChecksModule {}
