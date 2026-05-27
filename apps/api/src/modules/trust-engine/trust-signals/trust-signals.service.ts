import { Injectable } from '@nestjs/common';
import { TrustSignalsRepository } from './trust-signals.repository';
import { createTrustSignal } from './service-methods/create-trust-signal';
import { getSignalsByEntity } from './service-methods/get-signals-by-entity';
import {
  computeTrustScore,
  ComputedTrustScore,
} from './service-methods/compute-trust-score';
import {
  TrustSignal,
  CreateTrustSignalData,
  TrustSignalFilters,
} from './entities/trust-signal.entity';
import { EntityType } from '../../../generated/client';

@Injectable()
export class TrustSignalsService {
  constructor(private readonly repository: TrustSignalsRepository) {}

  createTrustSignal = (input: CreateTrustSignalData): Promise<TrustSignal> =>
    createTrustSignal(this.repository, input);

  getSignalsByEntity = (filters: TrustSignalFilters): Promise<TrustSignal[]> =>
    getSignalsByEntity(this.repository, filters);

  computeTrustScore = (
    entityType: EntityType,
    entityId: string,
  ): Promise<ComputedTrustScore> =>
    computeTrustScore(this.repository, entityType, entityId);
}
