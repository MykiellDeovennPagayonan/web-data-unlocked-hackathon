import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../common/guards/api-key.guard';
import { CurrentPlatform } from '../../../common/decorators/current-platform.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';
import { SubmitOrganizationDto } from './dto/submit-organization.dto';
import { Organization } from './entities/organization.entity';

@Controller()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post('admin/organizations')
  createOrganization(
    @Body() dto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.createOrganization(dto);
  }

  @Get('admin/organizations/:id')
  getOrganizationById(@Param('id') id: string): Promise<Organization | null> {
    return this.organizationsService.getOrganizationById(id);
  }

  @Get('admin/organizations/by-domain/:domain')
  getOrganizationByDomain(
    @Param('domain') domain: string,
  ): Promise<Organization | null> {
    return this.organizationsService.getOrganizationByDomain(domain);
  }

  @Patch('admin/organizations/:id/status')
  updateTrustStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationStatusDto,
  ): Promise<Organization> {
    return this.organizationsService.updateTrustStatus(id, dto.trustStatus);
  }

  @Post('v1/organizations')
  @UseGuards(ApiKeyGuard)
  submitOrganization(
    @CurrentPlatform() platformId: string,
    @Body() dto: SubmitOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.createOrganization({
      ...dto,
      submittedByPlatformId: platformId,
    });
  }
}
