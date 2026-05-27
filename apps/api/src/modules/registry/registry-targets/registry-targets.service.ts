import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { RegistryTargetsRepository } from './registry-targets.repository';
import { createTarget } from './service-methods/create-target';
import { getTargetsByEntry } from './service-methods/get-targets-by-entry';
import { findEntriesByEntity } from './service-methods/find-entries-by-entity';
import {
  RegistryTarget,
  CreateRegistryTargetData,
  EntityLookupFilters,
} from './entities/registry-target.entity';
import { RegistryEntry } from '../registry-entries/entities/registry-entry.entity';

@Injectable()
export class RegistryTargetsService {
  constructor(
    private readonly repository: RegistryTargetsRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createTarget = (input: CreateRegistryTargetData): Promise<RegistryTarget> =>
    createTarget(this.repository, this.auditLogsService, input);

  getTargetsByEntry = (registryEntryId: string): Promise<RegistryTarget[]> =>
    getTargetsByEntry(this.repository, registryEntryId);

  findEntriesByEntity = (
    filters: EntityLookupFilters,
  ): Promise<RegistryEntry[]> => findEntriesByEntity(this.repository, filters);
}
