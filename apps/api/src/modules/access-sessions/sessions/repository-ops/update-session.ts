import { PrismaService } from '../../../../prisma/prisma.service';
import { Session, UpdateSessionData } from '../entities/session.entity';

export async function updateSession(
  prisma: PrismaService,
  id: string,
  data: UpdateSessionData,
): Promise<Session> {
  return prisma.session.update({
    where: { id },
    data: {
      ...(data.riskScoreAtEnd !== undefined && {
        riskScoreAtEnd: data.riskScoreAtEnd,
      }),
      ...(data.endedAt !== undefined && { endedAt: data.endedAt }),
      ...(data.sessionVerdict !== undefined && {
        sessionVerdict: data.sessionVerdict,
      }),
      ...(data.terminationReason !== undefined && {
        terminationReason: data.terminationReason,
      }),
    },
  });
}
