import { PrismaService } from '../../../../prisma/prisma.service';
import {
  TrustSignal,
  CreateTrustSignalData,
} from '../entities/trust-signal.entity';

export async function insertTrustSignal(
  prisma: PrismaService,
  data: CreateTrustSignalData,
): Promise<TrustSignal> {
  return prisma.trustSignal.create({
    data: {
      entityType: data.entityType,
      identityId: data.identityId,
      orgId: data.orgId,
      signalType: data.signalType,
      weight: data.weight,
      source: data.source,
      referenceId: data.referenceId,
      expiresAt: data.expiresAt,
    },
  });
}
