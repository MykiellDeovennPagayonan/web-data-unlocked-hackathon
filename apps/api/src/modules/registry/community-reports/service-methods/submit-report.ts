import { CommunityReportsRepository } from '../community-reports.repository';
import {
  CommunityReport,
  CreateCommunityReportData,
} from '../entities/community-report.entity';

export async function submitReport(
  repository: CommunityReportsRepository,
  input: CreateCommunityReportData,
): Promise<CommunityReport> {
  return repository.insert(input);
}
