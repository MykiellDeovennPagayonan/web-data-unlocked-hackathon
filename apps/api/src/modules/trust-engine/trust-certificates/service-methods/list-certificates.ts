import { TrustCertificatesRepository } from '../trust-certificates.repository';
import { TrustCertificate } from '../entities/trust-certificate.entity';

export function listCertificates(
  repository: TrustCertificatesRepository,
  take?: number,
  skip?: number,
): Promise<TrustCertificate[]> {
  return repository.findMany(take, skip);
}
