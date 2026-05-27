import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertRequest } from './repository-ops/insert-request';
import { findRequestById } from './repository-ops/find-request-by-id';
import { listRequests } from './repository-ops/list-requests';
import { updateRequestStatus } from './repository-ops/update-request-status';
import {
  VerificationRequest,
  CreateVerificationRequestData,
  UpdateVerificationRequestStatusData,
  VerificationRequestFilters,
} from './entities/verification-request.entity';

@Injectable()
export class VerificationRequestsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (
    data: CreateVerificationRequestData,
  ): Promise<VerificationRequest> => insertRequest(this.prisma, data);

  findById = (id: string): Promise<VerificationRequest | null> =>
    findRequestById(this.prisma, id);

  list = (
    filters: VerificationRequestFilters,
  ): Promise<VerificationRequest[]> => listRequests(this.prisma, filters);

  updateStatus = (
    id: string,
    data: UpdateVerificationRequestStatusData,
  ): Promise<VerificationRequest> => updateRequestStatus(this.prisma, id, data);
}
