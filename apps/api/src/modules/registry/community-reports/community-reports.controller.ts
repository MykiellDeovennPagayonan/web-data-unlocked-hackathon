import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CommunityReportsService } from './community-reports.service';
import { CreateCommunityReportDto } from './dto/create-community-report.dto';
import { UpdateCommunityReportStatusDto } from './dto/update-community-report-status.dto';
import { CommunityReport } from './entities/community-report.entity';
import { hashEmail } from '../../../common/crypto/hash';
import {
  ReportStatus,
  TargetType,
  RegistrySeverity,
} from '../../../generated/client';

@Controller()
export class CommunityReportsController {
  constructor(
    private readonly communityReportsService: CommunityReportsService,
  ) {}

  @Post('v1/registry/community-reports')
  @UseGuards(ApiKeyGuard)
  submit(@Body() dto: CreateCommunityReportDto): Promise<CommunityReport> {
    return this.communityReportsService.submitReport({
      reportingPlatformId: dto.reportingPlatformId,
      targetType: dto.targetType,
      identityId: dto.identityId,
      orgId: dto.orgId,
      ipId: dto.ipId,
      emailHash: dto.email ? hashEmail(dto.email) : undefined,
      severity: dto.severity,
      category: dto.category,
      description: dto.description,
      evidenceUrls: dto.evidenceUrls,
    });
  }

  @Get('v1/registry/community-reports')
  @UseGuards(ApiKeyGuard)
  listByPlatform(
    @Query('reportingPlatformId') reportingPlatformId?: string,
    @Query('status') status?: ReportStatus,
    @Query('targetType') targetType?: TargetType,
  ): Promise<CommunityReport[]> {
    return this.communityReportsService.listReports({
      reportingPlatformId,
      status,
      targetType,
    });
  }

  @Get('v1/registry/community-reports/:id')
  @UseGuards(ApiKeyGuard)
  getById(@Param('id') id: string): Promise<CommunityReport | null> {
    return this.communityReportsService.getReportById(id);
  }

  @Patch('admin/community-reports/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommunityReportStatusDto,
  ): Promise<CommunityReport> {
    return this.communityReportsService.updateReportStatus(id, {
      status: dto.status,
      registryEntryId: dto.registryEntryId,
    });
  }

  @Post('admin/community-reports/:id/accept')
  accept(
    @Param('id') id: string,
    @Query('severity') severity?: RegistrySeverity,
  ): Promise<CommunityReport> {
    return this.communityReportsService.acceptReport({
      reportId: id,
      severity,
    });
  }
}
