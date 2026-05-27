import {
  VerificationRequest as PrismaVerificationRequest,
  VerificationType,
  VerificationStatus,
} from '../../../../generated/client';

export type VerificationRequest = PrismaVerificationRequest;

export interface CreateVerificationRequestData {
  identityId: string;
  platformId: string;
  verificationType: VerificationType;
  provider: string;
}

export interface UpdateVerificationRequestStatusData {
  status: VerificationStatus;
  submittedAt?: Date;
  decidedAt?: Date;
  rejectionReason?: string;
}

export interface VerificationRequestFilters {
  identityId?: string;
  platformId?: string;
  status?: VerificationStatus;
  verificationType?: VerificationType;
  limit?: number;
  offset?: number;
}
