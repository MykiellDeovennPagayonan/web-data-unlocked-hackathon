import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertTrustSignal } from './repository-ops/insert-trust-signal';
import { findSignalsByEntity } from './repository-ops/find-signals-by-entity';
import { findActiveSignalsByEntity } from './repository-ops/find-active-signals-by-entity';
import {
  TrustSignal,
  CreateTrustSignalData,
  TrustSignalFilters,
} from './entities/trust-signal.entity';
import { EntityType } from '../../../generated/client';

@Injectable()
export class TrustSignalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateTrustSignalData): Promise<TrustSignal> =>
    insertTrustSignal(this.prisma, data);

  findByEntity = (filters: TrustSignalFilters): Promise<TrustSignal[]> =>
    findSignalsByEntity(this.prisma, filters);

  findActiveByEntity = (
    entityType: EntityType,
    entityId: string,
  ): Promise<TrustSignal[]> =>
    findActiveSignalsByEntity(this.prisma, entityType, entityId);
}
