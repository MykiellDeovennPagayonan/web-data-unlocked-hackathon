import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReportStatus } from '../../../../generated/client';

export class UpdateCommunityReportStatusDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @IsOptional()
  @IsString()
  registryEntryId?: string;
}
