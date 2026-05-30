import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertOrganization } from './repository-ops/insert-organization';
import { findOrganizationById } from './repository-ops/find-organization-by-id';
import { findOrganizationByDomain } from './repository-ops/find-organization-by-domain';
import { findManyOrganizations } from './repository-ops/find-many-organizations';
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

  findMany = (take?: number, skip?: number): Promise<Organization[]> =>
    findManyOrganizations(this.prisma, take, skip);

  update = (id: string, data: UpdateOrganizationData): Promise<Organization> =>
    updateOrganization(this.prisma, id, data);
}
