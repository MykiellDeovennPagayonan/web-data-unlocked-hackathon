import { PrismaService } from '../../../../prisma/prisma.service';
import { Session } from '../entities/session.entity';

export async function findSessionById(
  prisma: PrismaService,
  id: string,
): Promise<Session | null> {
  return prisma.session.findUnique({ where: { id } });
}
