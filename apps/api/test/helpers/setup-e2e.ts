import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ApiKeysService } from '../../src/modules/platform-management/api-keys/api-keys.service';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
  apiKeysService: ApiKeysService;
}

export async function createTestApp(): Promise<TestApp> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  const prisma = app.get(PrismaService);
  const apiKeysService = app.get(ApiKeysService);

  return { app, prisma, apiKeysService };
}
