import 'dotenv/config';
import { PrismaClient } from '../../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

export async function wipeDatabase() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  });
  try {
    // Delete in reverse dependency order
    await prisma.$transaction([
      prisma.entityAlias.deleteMany(),
      prisma.platformUser.deleteMany(),
      prisma.webhookDeliveryLog.deleteMany(),
      prisma.apiKey.deleteMany(),
      prisma.platformRule.deleteMany(),
      prisma.certificateVerification.deleteMany(),
      prisma.communityReport.deleteMany(),
      prisma.registryTarget.deleteMany(),
      prisma.registryEntry.deleteMany(),
      prisma.behavioralEvent.deleteMany(),
      prisma.accessEvent.deleteMany(),
      prisma.session.deleteMany(),
      prisma.trustCertificate.deleteMany(),
      prisma.trustScoreSnapshot.deleteMany(),
      prisma.verificationRequest.deleteMany(),
      prisma.consentRecord.deleteMany(),
      prisma.trustSignal.deleteMany(),
      prisma.backgroundCheckResult.deleteMany(),
      prisma.backgroundCheck.deleteMany(),
      prisma.deviceSignal.deleteMany(),
      prisma.device.deleteMany(),
      prisma.ipRecord.deleteMany(),
      prisma.identity.deleteMany(),
      prisma.organization.deleteMany(),
      prisma.platform.deleteMany(),
      prisma.auditLog.deleteMany(),
    ]);
    console.log('Database wiped successfully');
  } finally {
    await prisma.$disconnect();
  }
}
