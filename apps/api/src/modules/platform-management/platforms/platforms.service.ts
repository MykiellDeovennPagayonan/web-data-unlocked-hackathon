import { Injectable } from '@nestjs/common';
import {
  PlatformStatus,
  StrictnessLevel,
} from '../../../../generated/prisma/client';
import { PlatformsRepository } from './platforms.repository';
import { createPlatform } from './service-methods/create-platform';
import { getPlatformById } from './service-methods/get-platform-by-id';
import { getPlatformByDomain } from './service-methods/get-platform-by-domain';
import { listPlatforms } from './service-methods/list-platforms';
import { updatePlatform } from './service-methods/update-platform';
import { updatePlatformStatus } from './service-methods/update-platform-status';
import { updateStrictnessLevel } from './service-methods/update-strictness-level';
import {
  CreatePlatformData,
  Platform,
  PlatformFilters,
  UpdatePlatformData,
} from './entities/platform.entity';

@Injectable()
export class PlatformsService {
  constructor(private readonly repository: PlatformsRepository) {}

  createPlatform = (input: CreatePlatformData): Promise<Platform> =>
    createPlatform(this.repository, input);

  getPlatformById = (id: string): Promise<Platform | null> =>
    getPlatformById(this.repository, id);

  getPlatformByDomain = (domain: string): Promise<Platform | null> =>
    getPlatformByDomain(this.repository, domain);

  listPlatforms = (filters: PlatformFilters): Promise<Platform[]> =>
    listPlatforms(this.repository, filters);

  updatePlatform = (id: string, input: UpdatePlatformData): Promise<Platform> =>
    updatePlatform(this.repository, id, input);

  updatePlatformStatus = (
    id: string,
    status: PlatformStatus,
  ): Promise<Platform> => updatePlatformStatus(this.repository, id, status);

  updateStrictnessLevel = (
    id: string,
    strictnessLevel: StrictnessLevel,
  ): Promise<Platform> =>
    updateStrictnessLevel(this.repository, id, strictnessLevel);
}
