import { CommunityReportsRepository } from '../community-reports.repository';
import {
  CommunityReport,
  CommunityReportFilters,
} from '../entities/community-report.entity';

export async function listReports(
  repository: CommunityReportsRepository,
  filters: CommunityReportFilters,
): Promise<CommunityReport[]> {
  return repository.list(filters);
}
