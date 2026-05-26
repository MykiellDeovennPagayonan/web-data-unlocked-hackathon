import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertPlatform } from './repository-ops/insert-platform';
import { findPlatformById } from './repository-ops/find-platform-by-id';
import { findPlatformByDomain } from './repository-ops/find-platform-by-domain';
import { findManyPlatforms } from './repository-ops/find-many-platforms';
import { updatePlatform } from './repository-ops/update-platform';
import {
  CreatePlatformData,
  Platform,
  PlatformFilters,
  UpdatePlatformData,
} from './entities/platform.entity';

@Injectable()
export class PlatformsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreatePlatformData): Promise<Platform> =>
    insertPlatform(this.prisma, data);

  findById = (id: string): Promise<Platform | null> =>
    findPlatformById(this.prisma, id);

  findByDomain = (domain: string): Promise<Platform | null> =>
    findPlatformByDomain(this.prisma, domain);

  findMany = (filters: PlatformFilters): Promise<Platform[]> =>
    findManyPlatforms(this.prisma, filters);

  update = (id: string, data: UpdatePlatformData): Promise<Platform> =>
    updatePlatform(this.prisma, id, data);
}
