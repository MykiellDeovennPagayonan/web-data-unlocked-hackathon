import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AccessEventsService } from '../../src/modules/access-sessions/access-events/access-events.service';
import { BehavioralEventsService } from '../../src/modules/access-sessions/behavioral-events/behavioral-events.service';
import { SessionsService } from '../../src/modules/access-sessions/sessions/sessions.service';
import { BackgroundCheckResultsService } from '../../src/modules/background-checks/background-check-results/background-check-results.service';
import { BackgroundChecksService } from '../../src/modules/background-checks/background-checks/background-checks.service';
import { ConsentRecordsService } from '../../src/modules/compliance/consent-records/consent-records.service';
import { VerificationRequestsService } from '../../src/modules/compliance/verification-requests/verification-requests.service';
import { EntityAliasesService } from '../../src/modules/identity/entity-aliases/entity-aliases.service';
import { DevicesService } from '../../src/modules/device-intelligence/devices/devices.service';
import { IpRecordsService } from '../../src/modules/device-intelligence/ip-records/ip-records.service';
import { ApiKeysService } from '../../src/modules/platform-management/api-keys/api-keys.service';
import { CommunityReportsService } from '../../src/modules/registry/community-reports/community-reports.service';
import { RegistryEntriesService } from '../../src/modules/registry/registry-entries/registry-entries.service';
import { RegistryTargetsService } from '../../src/modules/registry/registry-targets/registry-targets.service';
import { CertificateVerificationsService } from '../../src/modules/trust-engine/certificate-verifications/certificate-verifications.service';
import { TrustCertificatesService } from '../../src/modules/trust-engine/trust-certificates/trust-certificates.service';
import { TrustScoreSnapshotsService } from '../../src/modules/trust-engine/trust-score-snapshots/trust-score-snapshots.service';
import { TrustSignalsService } from '../../src/modules/trust-engine/trust-signals/trust-signals.service';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
  apiKeysService: ApiKeysService;
  devicesService: DevicesService;
  ipRecordsService: IpRecordsService;
  backgroundChecksService: BackgroundChecksService;
  backgroundCheckResultsService: BackgroundCheckResultsService;
  trustSignalsService: TrustSignalsService;
  sessionsService: SessionsService;
  accessEventsService: AccessEventsService;
  behavioralEventsService: BehavioralEventsService;
  trustCertificatesService: TrustCertificatesService;
  certificateVerificationsService: CertificateVerificationsService;
  trustScoreSnapshotsService: TrustScoreSnapshotsService;
  registryEntriesService: RegistryEntriesService;
  registryTargetsService: RegistryTargetsService;
  communityReportsService: CommunityReportsService;
  consentRecordsService: ConsentRecordsService;
  verificationRequestsService: VerificationRequestsService;
  entityAliasesService: EntityAliasesService;
}

export async function createTestApp(): Promise<TestApp> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const prisma = app.get(PrismaService);
  const apiKeysService = app.get(ApiKeysService);
  const devicesService = app.get(DevicesService);
  const ipRecordsService = app.get(IpRecordsService);
  const backgroundChecksService = app.get(BackgroundChecksService);
  const backgroundCheckResultsService = app.get(BackgroundCheckResultsService);
  const trustSignalsService = app.get(TrustSignalsService);
  const sessionsService = app.get(SessionsService);
  const accessEventsService = app.get(AccessEventsService);
  const behavioralEventsService = app.get(BehavioralEventsService);
  const trustCertificatesService = app.get(TrustCertificatesService);
  const certificateVerificationsService = app.get(
    CertificateVerificationsService,
  );
  const trustScoreSnapshotsService = app.get(TrustScoreSnapshotsService);
  const registryEntriesService = app.get(RegistryEntriesService);
  const registryTargetsService = app.get(RegistryTargetsService);
  const communityReportsService = app.get(CommunityReportsService);
  const consentRecordsService = app.get(ConsentRecordsService);
  const verificationRequestsService = app.get(VerificationRequestsService);
  const entityAliasesService = app.get(EntityAliasesService);

  return {
    app,
    prisma,
    apiKeysService,
    devicesService,
    ipRecordsService,
    backgroundChecksService,
    backgroundCheckResultsService,
    trustSignalsService,
    sessionsService,
    accessEventsService,
    behavioralEventsService,
    trustCertificatesService,
    certificateVerificationsService,
    trustScoreSnapshotsService,
    registryEntriesService,
    registryTargetsService,
    communityReportsService,
    consentRecordsService,
    verificationRequestsService,
    entityAliasesService,
  };
}
