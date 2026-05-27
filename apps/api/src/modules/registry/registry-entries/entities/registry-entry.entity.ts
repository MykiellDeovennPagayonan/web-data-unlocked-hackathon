import {
  RegistryEntry as PrismaRegistryEntry,
  ListType,
  RegistrySeverity,
  RegistrySourceType,
} from '../../../../generated/client';

export type RegistryEntry = PrismaRegistryEntry;

export interface CreateRegistryEntryData {
  listType: ListType;
  severity: RegistrySeverity;
  sourceType: RegistrySourceType;
}

export interface UpdateRegistryEntryData {
  listType?: ListType;
  severity?: RegistrySeverity;
  sourceType?: RegistrySourceType;
  reportCount?: number;
  isActive?: boolean;
}

export interface RegistryEntryFilters {
  listType?: ListType;
  severity?: RegistrySeverity;
  sourceType?: RegistrySourceType;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}
