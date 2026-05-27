import { CommunityReportsRepository } from '../community-reports.repository';
import { CommunityReport } from '../entities/community-report.entity';

export async function getReportById(
  repository: CommunityReportsRepository,
  id: string,
): Promise<CommunityReport | null> {
  return repository.findById(id);
}
