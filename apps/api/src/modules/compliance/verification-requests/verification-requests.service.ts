import { Injectable } from '@nestjs/common';
import { VerificationRequestsRepository } from './verification-requests.repository';
import { TrustSignalsService } from '../../trust-engine/trust-signals/trust-signals.service';
import { TrustScoreSnapshotsService } from '../../trust-engine/trust-score-snapshots/trust-score-snapshots.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { createRequest } from './service-methods/create-request';
import { getRequestById } from './service-methods/get-request-by-id';
import { listRequests } from './service-methods/list-requests';
import { submitRequest } from './service-methods/submit-request';
import { approveVerification } from './service-methods/approve-verification';
import { rejectVerification } from './service-methods/reject-verification';
import {
  VerificationRequest,
  CreateVerificationRequestData,
  VerificationRequestFilters,
} from './entities/verification-request.entity';

@Injectable()
export class VerificationRequestsService {
  constructor(
    private readonly repository: VerificationRequestsRepository,
    private readonly trustSignalsService: TrustSignalsService,
    private readonly trustScoreSnapshotsService: TrustScoreSnapshotsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  createRequest = (
    input: CreateVerificationRequestData,
  ): Promise<VerificationRequest> => createRequest(this.repository, input);

  getRequestById = (id: string): Promise<VerificationRequest | null> =>
    getRequestById(this.repository, id);

  listRequests = (
    filters: VerificationRequestFilters,
  ): Promise<VerificationRequest[]> => listRequests(this.repository, filters);

  submitRequest = (id: string): Promise<VerificationRequest> =>
    submitRequest(this.repository, id);

  approveVerification = (id: string): Promise<VerificationRequest> =>
    approveVerification(
      this.repository,
      this.trustSignalsService,
      this.trustScoreSnapshotsService,
      this.auditLogsService,
      id,
    );

  rejectVerification = (
    id: string,
    rejectionReason?: string,
  ): Promise<VerificationRequest> =>
    rejectVerification(
      this.repository,
      this.trustSignalsService,
      this.auditLogsService,
      id,
      rejectionReason,
    );
}
