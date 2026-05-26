import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertOrganization } from './repository-ops/insert-organization';
import { findOrganizationById } from './repository-ops/find-organization-by-id';
import { findOrganizationByDomain } from './repository-ops/find-organization-by-domain';
import { updateOrganization } from './repository-ops/update-organization';
import {
  CreateOrganizationData,
  Organization,
  UpdateOrganizationData,
} from './entities/organization.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateOrganizationData): Promise<Organization> =>
    insertOrganization(this.prisma, data);

  findById = (id: string): Promise<Organization | null> =>
    findOrganizationById(this.prisma, id);

  findByDomain = (domain: string): Promise<Organization | null> =>
    findOrganizationByDomain(this.prisma, domain);

  update = (id: string, data: UpdateOrganizationData): Promise<Organization> =>
    updateOrganization(this.prisma, id, data);
}
