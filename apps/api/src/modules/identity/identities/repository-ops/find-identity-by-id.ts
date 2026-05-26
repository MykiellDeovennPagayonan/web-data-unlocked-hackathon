import { PrismaService } from '../../../../prisma/prisma.service';
import { Identity } from '../entities/identity.entity';

export function findIdentityById(
  prisma: PrismaService,
  id: string,
): Promise<Identity | null> {
  return prisma.identity.findUnique({
    where: { id },
  });
}
