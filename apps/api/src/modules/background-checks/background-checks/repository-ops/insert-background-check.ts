import { PrismaService } from '../../../../prisma/prisma.service';
import {
  BackgroundCheck,
  CreateBackgroundCheckData,
} from '../entities/background-check.entity';
import { CheckVerdict } from '../../../../generated/client';

export async function insertBackgroundCheck(
  prisma: PrismaService,
  data: CreateBackgroundCheckData,
): Promise<BackgroundCheck> {
  return prisma.backgroundCheck.create({
    data: {
      entityType: data.entityType,
      identityId: data.identityId,
      orgId: data.orgId,
      triggeredBy: data.triggeredBy,
      overallVerdict: data.overallVerdict ?? CheckVerdict.clean,
    },
  });
}
