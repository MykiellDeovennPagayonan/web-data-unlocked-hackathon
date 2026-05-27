import { Module } from '@nestjs/common';
import { ComplianceModule } from '../../compliance/compliance.module';
import { IdentitiesController } from './identities.controller';
import { IdentitiesService } from './identities.service';
import { IdentitiesRepository } from './identities.repository';

@Module({
  imports: [ComplianceModule],
  controllers: [IdentitiesController],
  providers: [IdentitiesService, IdentitiesRepository],
  exports: [IdentitiesService, IdentitiesRepository],
})
export class IdentitiesModule {}
