import { Module } from '@nestjs/common';
import { ComplianceModule } from '../../compliance/compliance.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { PlatformManagementModule } from '../../platform-management/platform-management.module';

@Module({
  imports: [PlatformManagementModule, ComplianceModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationsRepository],
  exports: [OrganizationsService, OrganizationsRepository],
})
export class OrganizationsModule {}
