import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertVerification } from './repository-ops/insert-verification';
import { findVerificationsByCertificate } from './repository-ops/find-verifications-by-certificate';
import {
  CertificateVerification,
  CreateCertificateVerificationData,
} from './entities/certificate-verification.entity';

@Injectable()
export class CertificateVerificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (
    data: CreateCertificateVerificationData,
  ): Promise<CertificateVerification> => insertVerification(this.prisma, data);

  findByCertificate = (
    certificateId: string,
  ): Promise<CertificateVerification[]> =>
    findVerificationsByCertificate(this.prisma, certificateId);
}
