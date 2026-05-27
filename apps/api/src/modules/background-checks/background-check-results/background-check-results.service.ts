import { Injectable } from '@nestjs/common';
import { BackgroundCheckResultsRepository } from './background-check-results.repository';
import { addCheckResult } from './service-methods/add-check-result';
import { getResultsByCheckId } from './service-methods/get-results-by-check-id';
import {
  BackgroundCheckResult,
  CreateBackgroundCheckResultData,
} from './entities/background-check-result.entity';

@Injectable()
export class BackgroundCheckResultsService {
  constructor(private readonly repository: BackgroundCheckResultsRepository) {}

  addCheckResult = (
    input: CreateBackgroundCheckResultData,
  ): Promise<BackgroundCheckResult> => addCheckResult(this.repository, input);

  getResultsByCheckId = (checkId: string): Promise<BackgroundCheckResult[]> =>
    getResultsByCheckId(this.repository, checkId);
}
