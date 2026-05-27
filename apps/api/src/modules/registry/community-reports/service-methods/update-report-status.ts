import { CommunityReportsRepository } from '../community-reports.repository';
import {
  CommunityReport,
  UpdateCommunityReportStatusData,
} from '../entities/community-report.entity';

export async function updateReportStatus(
  repository: CommunityReportsRepository,
  id: string,
  input: UpdateCommunityReportStatusData,
): Promise<CommunityReport> {
  return repository.updateStatus(id, input);
}
