import { Module } from '@nestjs/common';
import { IdentitiesController } from '../identities.controller';
import { IdentitiesService } from '../identities.service';
import { IdentitiesRepository } from './identities.repository';

@Module({
  controllers: [IdentitiesController],
  providers: [IdentitiesService, IdentitiesRepository],
  exports: [IdentitiesService, IdentitiesRepository],
})
export class IdentitiesModule {}
