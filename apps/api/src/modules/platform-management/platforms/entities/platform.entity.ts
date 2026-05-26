import {
  Platform as PrismaPlatform,
  PlatformStatus,
  StrictnessLevel,
} from '../../../../../generated/prisma/client';

export type Platform = PrismaPlatform;

export interface CreatePlatformData {
  name: string;
  domain: string;
  status?: PlatformStatus;
  strictnessLevel: StrictnessLevel;
}

export interface UpdatePlatformData {
  name?: string;
  domain?: string;
  status?: PlatformStatus;
  strictnessLevel?: StrictnessLevel;
}

export interface PlatformFilters {
  status?: PlatformStatus;
  limit?: number;
  offset?: number;
}
