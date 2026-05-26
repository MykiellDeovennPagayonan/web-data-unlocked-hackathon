import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertIdentity } from './repository-ops/insert-identity';
import { findIdentityById } from './repository-ops/find-identity-by-id';
import { findIdentityByEmailHash } from './repository-ops/find-identity-by-email-hash';
import { updateIdentity } from './repository-ops/update-identity';
import {
  CreateIdentityData,
  Identity,
  UpdateIdentityData,
} from './entities/identity.entity';

@Injectable()
export class IdentitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateIdentityData): Promise<Identity> =>
    insertIdentity(this.prisma, data);

  findById = (id: string): Promise<Identity | null> =>
    findIdentityById(this.prisma, id);

  findByEmailHash = (hash: string): Promise<Identity | null> =>
    findIdentityByEmailHash(this.prisma, hash);

  update = (id: string, data: UpdateIdentityData): Promise<Identity> =>
    updateIdentity(this.prisma, id, data);
}
