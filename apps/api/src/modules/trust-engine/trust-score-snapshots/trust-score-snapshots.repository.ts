import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertSnapshot } from './repository-ops/insert-snapshot';
import { findSnapshotsByEntity } from './repository-ops/find-snapshots-by-entity';
import {
  TrustScoreSnapshot,
  CreateTrustScoreSnapshotData,
} from './entities/trust-score-snapshot.entity';
import { EntityType } from '../../../generated/client';

@Injectable()
export class TrustScoreSnapshotsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateTrustScoreSnapshotData): Promise<TrustScoreSnapshot> =>
    insertSnapshot(this.prisma, data);

  findByEntity = (
    entityType: EntityType,
    entityId: string,
  ): Promise<TrustScoreSnapshot[]> =>
    findSnapshotsByEntity(this.prisma, entityType, entityId);
}
