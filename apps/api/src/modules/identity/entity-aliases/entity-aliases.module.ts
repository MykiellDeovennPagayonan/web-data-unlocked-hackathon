import { Module } from '@nestjs/common';
import { EntityAliasesController } from './entity-aliases.controller';
import { EntityAliasesService } from './entity-aliases.service';
import { EntityAliasesRepository } from './entity-aliases.repository';

@Module({
  controllers: [EntityAliasesController],
  providers: [EntityAliasesService, EntityAliasesRepository],
  exports: [EntityAliasesService, EntityAliasesRepository],
})
export class EntityAliasesModule {}
