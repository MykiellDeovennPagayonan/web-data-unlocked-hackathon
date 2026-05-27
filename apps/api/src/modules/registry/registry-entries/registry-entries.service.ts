import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { RegistryEntriesRepository } from './registry-entries.repository';
import { createEntry } from './service-methods/create-entry';
import { getEntryById } from './service-methods/get-entry-by-id';
import { listEntries } from './service-methods/list-entries';
import { updateEntry } from './service-methods/update-entry';
import { escalateSeverity } from './service-methods/escalate-severity';
import {
  RegistryEntry,
  CreateRegistryEntryData,
  UpdateRegistryEntryData,
  RegistryEntryFilters,
} from './entities/registry-entry.entity';

@Injectable()
export class RegistryEntriesService {
  constructor(
    private readonly repository: RegistryEntriesRepository,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createEntry = (input: CreateRegistryEntryData): Promise<RegistryEntry> =>
    createEntry(this.repository, this.auditLogsService, input);

  getEntryById = (id: string): Promise<RegistryEntry | null> =>
    getEntryById(this.repository, id);

  listEntries = (filters: RegistryEntryFilters): Promise<RegistryEntry[]> =>
    listEntries(this.repository, filters);

  updateEntry = (
    id: string,
    input: UpdateRegistryEntryData,
  ): Promise<RegistryEntry> =>
    updateEntry(this.repository, this.auditLogsService, id, input);

  escalateSeverity = (id: string): Promise<RegistryEntry> =>
    escalateSeverity(this.repository, this.auditLogsService, id);
}
