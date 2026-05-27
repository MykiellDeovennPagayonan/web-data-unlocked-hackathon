import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertCertificate } from './repository-ops/insert-certificate';
import { findCertificateById } from './repository-ops/find-certificate-by-id';
import { findCertificatesByEntity } from './repository-ops/find-certificates-by-entity';
import { updateCertificate } from './repository-ops/update-certificate';
import {
  TrustCertificate,
  CreateTrustCertificateData,
  RevokeCertificateData,
} from './entities/trust-certificate.entity';
import { EntityType } from '../../../generated/client';

@Injectable()
export class TrustCertificatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateTrustCertificateData): Promise<TrustCertificate> =>
    insertCertificate(this.prisma, data);

  findById = (id: string): Promise<TrustCertificate | null> =>
    findCertificateById(this.prisma, id);

  findByEntity = (
    entityType: EntityType,
    entityId: string,
  ): Promise<TrustCertificate[]> =>
    findCertificatesByEntity(this.prisma, entityType, entityId);

  update = (
    id: string,
    data: RevokeCertificateData,
  ): Promise<TrustCertificate> => updateCertificate(this.prisma, id, data);
}
