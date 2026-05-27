import { TrustCertificatesRepository } from '../trust-certificates.repository';
import { TrustCertificate } from '../entities/trust-certificate.entity';
import { EntityType } from '../../../../generated/client';

export async function getCertificatesByEntity(
  repository: TrustCertificatesRepository,
  entityType: EntityType,
  entityId: string,
): Promise<TrustCertificate[]> {
  return repository.findByEntity(entityType, entityId);
}
