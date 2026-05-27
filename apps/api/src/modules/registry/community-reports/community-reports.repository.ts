import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertReport } from './repository-ops/insert-report';
import { findReportById } from './repository-ops/find-report-by-id';
import { listReports } from './repository-ops/list-reports';
import { updateReportStatus } from './repository-ops/update-report-status';
import {
  CommunityReport,
  CreateCommunityReportData,
  UpdateCommunityReportStatusData,
  CommunityReportFilters,
} from './entities/community-report.entity';

@Injectable()
export class CommunityReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateCommunityReportData): Promise<CommunityReport> =>
    insertReport(this.prisma, data);

  findById = (id: string): Promise<CommunityReport | null> =>
    findReportById(this.prisma, id);

  list = (filters: CommunityReportFilters): Promise<CommunityReport[]> =>
    listReports(this.prisma, filters);

  updateStatus = (
    id: string,
    data: UpdateCommunityReportStatusData,
  ): Promise<CommunityReport> => updateReportStatus(this.prisma, id, data);
}
