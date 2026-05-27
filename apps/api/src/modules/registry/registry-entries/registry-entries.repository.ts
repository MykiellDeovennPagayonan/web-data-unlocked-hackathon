import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertEntry } from './repository-ops/insert-entry';
import { findEntryById } from './repository-ops/find-entry-by-id';
import { listEntries } from './repository-ops/list-entries';
import { updateEntry } from './repository-ops/update-entry';
import {
  RegistryEntry,
  CreateRegistryEntryData,
  UpdateRegistryEntryData,
  RegistryEntryFilters,
} from './entities/registry-entry.entity';

@Injectable()
export class RegistryEntriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateRegistryEntryData): Promise<RegistryEntry> =>
    insertEntry(this.prisma, data);

  findById = (id: string): Promise<RegistryEntry | null> =>
    findEntryById(this.prisma, id);

  list = (filters: RegistryEntryFilters): Promise<RegistryEntry[]> =>
    listEntries(this.prisma, filters);

  update = (
    id: string,
    data: UpdateRegistryEntryData,
  ): Promise<RegistryEntry> => updateEntry(this.prisma, id, data);
}
