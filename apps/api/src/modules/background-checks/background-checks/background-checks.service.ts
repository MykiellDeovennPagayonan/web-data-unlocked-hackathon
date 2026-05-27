import { Injectable } from '@nestjs/common';
import { BackgroundChecksRepository } from './background-checks.repository';
import { TrustSignalsService } from '../../trust-engine/trust-signals/trust-signals.service';
import { createBackgroundCheck } from './service-methods/create-background-check';
import { getBackgroundCheckById } from './service-methods/get-background-check-by-id';
import { listBackgroundChecksByEntity } from './service-methods/list-background-checks-by-entity';
import {
  completeBackgroundCheck,
  CompleteBackgroundCheckInput,
} from './service-methods/complete-background-check';
import {
  BackgroundCheck,
  BackgroundCheckFilters,
  CreateBackgroundCheckData,
} from './entities/background-check.entity';

@Injectable()
export class BackgroundChecksService {
  constructor(
    private readonly repository: BackgroundChecksRepository,
    private readonly trustSignalsService: TrustSignalsService,
  ) {}

  createBackgroundCheck = (
    input: CreateBackgroundCheckData,
  ): Promise<BackgroundCheck> => createBackgroundCheck(this.repository, input);

  getBackgroundCheckById = (id: string): Promise<BackgroundCheck | null> =>
    getBackgroundCheckById(this.repository, id);

  listBackgroundChecksByEntity = (
    filters: BackgroundCheckFilters,
  ): Promise<BackgroundCheck[]> =>
    listBackgroundChecksByEntity(this.repository, filters);

  completeBackgroundCheck = (
    input: CompleteBackgroundCheckInput,
  ): Promise<BackgroundCheck> =>
    completeBackgroundCheck(this.repository, this.trustSignalsService, input);
}
