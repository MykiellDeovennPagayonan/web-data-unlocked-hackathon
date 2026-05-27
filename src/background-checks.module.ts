import { Module } from '@nestjs/common';
import { BackgroundChecksModule } from './background-checks/background-checks.module';

@Module({
  imports: [BackgroundChecksModule]
})
export class BackgroundChecksModule {}
