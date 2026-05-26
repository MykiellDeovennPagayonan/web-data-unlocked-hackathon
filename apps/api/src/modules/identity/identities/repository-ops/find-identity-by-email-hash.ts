import { PrismaService } from '../../../../prisma/prisma.service';
import { Identity } from '../entities/identity.entity';

export function findIdentityByEmailHash(
  prisma: PrismaService,
  emailHash: string,
): Promise<Identity | null> {
  return prisma.identity.findUnique({
    where: { emailHash },
  });
}
