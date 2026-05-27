import { PrismaService } from '../../../../prisma/prisma.service';
import {
  TrustSignal,
  TrustSignalFilters,
} from '../entities/trust-signal.entity';

export async function findSignalsByEntity(
  prisma: PrismaService,
  filters: TrustSignalFilters,
): Promise<TrustSignal[]> {
  return prisma.trustSignal.findMany({
    where: {
      entityType: filters.entityType,
      identityId: filters.identityId,
      orgId: filters.orgId,
      signalType: filters.signalType,
      source: filters.source,
    },
    orderBy: { createdAt: 'desc' },
  });
}
