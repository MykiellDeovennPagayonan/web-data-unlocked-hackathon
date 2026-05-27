import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertTarget } from './repository-ops/insert-target';
import { findTargetsByEntry } from './repository-ops/find-targets-by-entry';
import { findEntriesByEntity } from './repository-ops/find-entries-by-entity';
import {
  RegistryTarget,
  CreateRegistryTargetData,
  EntityLookupFilters,
} from './entities/registry-target.entity';
import { RegistryEntry } from '../registry-entries/entities/registry-entry.entity';

@Injectable()
export class RegistryTargetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateRegistryTargetData): Promise<RegistryTarget> =>
    insertTarget(this.prisma, data);

  findByEntryId = (registryEntryId: string): Promise<RegistryTarget[]> =>
    findTargetsByEntry(this.prisma, registryEntryId);

  findEntriesByEntity = (
    filters: EntityLookupFilters,
  ): Promise<RegistryEntry[]> => findEntriesByEntity(this.prisma, filters);
}
