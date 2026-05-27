import { SessionVerdict } from '../../../../generated/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateSessionData, Session } from '../entities/session.entity';

export async function insertSession(
  prisma: PrismaService,
  data: CreateSessionData,
): Promise<Session> {
  return prisma.session.create({
    data: {
      identityId: data.identityId,
      platformId: data.platformId,
      ipId: data.ipId,
      deviceId: data.deviceId,
      sessionTokenHash: data.sessionTokenHash,
      riskScoreAtStart: data.riskScoreAtStart,
      sessionVerdict: SessionVerdict.clean,
    },
  });
}
