import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertAccessEvent } from './repository-ops/insert-access-event';
import { findAccessEventsByPlatform } from './repository-ops/find-access-events-by-platform';
import { findAccessEventsByIdentity } from './repository-ops/find-access-events-by-identity';
import {
  AccessEvent,
  CreateAccessEventData,
} from './entities/access-event.entity';

@Injectable()
export class AccessEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateAccessEventData): Promise<AccessEvent> =>
    insertAccessEvent(this.prisma, data);

  findByPlatform = (
    platformId: string,
    take?: number,
  ): Promise<AccessEvent[]> =>
    findAccessEventsByPlatform(this.prisma, platformId, take);

  findByIdentity = (
    identityId: string,
    take?: number,
  ): Promise<AccessEvent[]> =>
    findAccessEventsByIdentity(this.prisma, identityId, take);
}
