import {
  RegistryTarget as PrismaRegistryTarget,
  TargetType,
} from '../../../../generated/client';

export type RegistryTarget = PrismaRegistryTarget;

export interface CreateRegistryTargetData {
  registryEntryId: string;
  targetType: TargetType;
  identityId?: string;
  orgId?: string;
  ipId?: string;
  deviceId?: string;
  emailHash?: string;
}

export interface EntityLookupFilters {
  targetType: TargetType;
  identityId?: string;
  orgId?: string;
  ipId?: string;
  deviceId?: string;
  emailHash?: string;
}
