import { Injectable } from '@nestjs/common';
import { IdentitiesRepository } from './identities.repository';
import { createIdentity } from './service-methods/create-identity';
import { getIdentityById } from './service-methods/get-identity-by-id';
import { getIdentityByEmailHash } from './service-methods/get-identity-by-email-hash';
import { updateTrustStatus } from './service-methods/update-trust-status';
import {
  CreateIdentityData,
  Identity,
  UpdateIdentityData,
} from './entities/identity.entity';

@Injectable()
export class IdentitiesService {
  constructor(private readonly repository: IdentitiesRepository) {}

  createIdentity = (input: CreateIdentityData): Promise<Identity> =>
    createIdentity(this.repository, input);

  getIdentityById = (id: string): Promise<Identity | null> =>
    getIdentityById(this.repository, id);

  getIdentityByEmailHash = (hash: string): Promise<Identity | null> =>
    getIdentityByEmailHash(this.repository, hash);

  updateTrustStatus = (
    id: string,
    status: UpdateIdentityData['trustStatus'],
  ): Promise<Identity> => updateTrustStatus(this.repository, id, status);
}
