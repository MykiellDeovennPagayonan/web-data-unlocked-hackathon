import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TrustSignalsController } from './trust-signals/trust-signals.controller';
import { TrustSignalsService } from './trust-signals/trust-signals.service';
import { TrustSignalsRepository } from './trust-signals/trust-signals.repository';
import { TrustScoreSnapshotsController } from './trust-score-snapshots/trust-score-snapshots.controller';
import { TrustScoreSnapshotsService } from './trust-score-snapshots/trust-score-snapshots.service';
import { TrustScoreSnapshotsRepository } from './trust-score-snapshots/trust-score-snapshots.repository';
import { TrustCertificatesController } from './trust-certificates/trust-certificates.controller';
import { TrustCertificatesService } from './trust-certificates/trust-certificates.service';
import { TrustCertificatesRepository } from './trust-certificates/trust-certificates.repository';
import { CertificateVerificationsController } from './certificate-verifications/certificate-verifications.controller';
import { CertificateVerificationsService } from './certificate-verifications/certificate-verifications.service';
import { CertificateVerificationsRepository } from './certificate-verifications/certificate-verifications.repository';

@Module({
  controllers: [
    TrustSignalsController,
    TrustScoreSnapshotsController,
    TrustCertificatesController,
    CertificateVerificationsController,
  ],
  providers: [
    PrismaService,
    TrustSignalsService,
    TrustSignalsRepository,
    TrustScoreSnapshotsService,
    TrustScoreSnapshotsRepository,
    TrustCertificatesService,
    TrustCertificatesRepository,
    CertificateVerificationsService,
    CertificateVerificationsRepository,
  ],
  exports: [
    TrustSignalsService,
    TrustScoreSnapshotsService,
    TrustCertificatesService,
    CertificateVerificationsService,
  ],
})
export class TrustEngineModule {}
