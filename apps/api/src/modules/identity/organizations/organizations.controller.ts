import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationStatusDto } from './dto/update-organization-status.dto';
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
  submitOrganization(
    @Body() dto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.createOrganization(dto);
  }
}
