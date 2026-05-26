import { Injectable } from '@nestjs/common';
import { IdentitiesRepository } from './identities/identities.repository';
import { createIdentity } from './identities/service-methods/create-identity';
import { getIdentityById } from './identities/service-methods/get-identity-by-id';
import { getIdentityByEmailHash } from './identities/service-methods/get-identity-by-email-hash';
import { updateTrustStatus } from './identities/service-methods/update-trust-status';
import {
  CreateIdentityData,
  Identity,
  UpdateIdentityData,
} from './identities/entities/identity.entity';

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
