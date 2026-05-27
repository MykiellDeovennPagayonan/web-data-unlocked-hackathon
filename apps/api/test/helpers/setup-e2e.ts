import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ApiKeysService } from '../../src/modules/platform-management/api-keys/api-keys.service';
import { DevicesService } from '../../src/modules/device-intelligence/devices/devices.service';
import { IpRecordsService } from '../../src/modules/device-intelligence/ip-records/ip-records.service';
import { BackgroundChecksService } from '../../src/modules/background-checks/background-checks/background-checks.service';
import { BackgroundCheckResultsService } from '../../src/modules/background-checks/background-check-results/background-check-results.service';
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

  return {
    app,
    prisma,
    apiKeysService,
    devicesService,
    ipRecordsService,
    backgroundChecksService,
    backgroundCheckResultsService,
    trustSignalsService,
  };
}
