import { createHash } from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  AccessEventType,
  AccessVerdict,
  CertificateStatus,
  CheckTrigger,
  CheckVerdict,
  EntityType,
  IpType,
  PlatformStatus,
  PlatformUserStatus,
  PrismaClient,
  ReportCategory,
  ReportSeverity,
  ReportStatus,
  SessionVerdict,
  StrictnessLevel,
  TargetType,
  TrustStatus,
  VerificationStatus,
  VerificationType,
} from '../generated/client';

const seedDomain = 'acme-admin-seed.local';
const now = new Date();

const identities = [
  ['jane.doe@acme.com', 'Jane Doe', TrustStatus.flagged],
  ['service-account-1', 'Service Account 1', TrustStatus.clean],
  ['mobile_user_392', 'Mobile User 392', TrustStatus.limited],
  ['admin@acme.com', 'Admin Acme', TrustStatus.verified],
  ['api-user', 'API User', TrustStatus.flagged],
  ['batch@acme.com', 'Batch Worker', TrustStatus.limited],
  ['contractor.user', 'Contractor User', TrustStatus.flagged],
  ['infra-id@acme.com', 'Infrastructure Identity', TrustStatus.blocked],
] as const;

const origins = [
  {
    ipAddress: '203.0.113.45',
    ipType: IpType.vpn,
    country: 'RU',
    region: 'Moscow',
    asn: 'AS8359 MTS',
    riskScore: 96,
    current: 34,
    previous: 22,
    device: 'Chrome 125',
    client: 'Windows',
  },
  {
    ipAddress: '198.51.100.23',
    ipType: IpType.datacenter,
    country: 'US',
    region: 'New York',
    asn: 'AS15169 Google',
    riskScore: 42,
    current: 28,
    previous: 24,
    device: 'AkamaiWP.21',
    client: 'Server',
  },
  {
    ipAddress: '45.73.32.11',
    ipType: IpType.mobile,
    country: 'GB',
    region: 'London',
    asn: 'AS5089 Virgin Media',
    riskScore: 68,
    current: 19,
    previous: 15,
    device: 'iOS 17.5',
    client: 'iPhone',
  },
  {
    ipAddress: '203.0.113.85',
    ipType: IpType.residential,
    country: 'US',
    region: 'San Francisco',
    asn: 'AS7922 Comcast',
    riskScore: 18,
    current: 25,
    previous: 23,
    device: 'Chrome 125',
    client: 'macOS',
  },
  {
    ipAddress: '185.199.110.153',
    ipType: IpType.datacenter,
    country: 'BR',
    region: 'Sao Paulo',
    asn: 'AS61884 Latitude.sh',
    riskScore: 56,
    current: 17,
    previous: 11,
    device: 'curl/8.5.0',
    client: 'Linux',
  },
  {
    ipAddress: '192.0.2.77',
    ipType: IpType.proxy,
    country: 'CA',
    region: 'Toronto',
    asn: 'AS577 Bell Canada',
    riskScore: 63,
    current: 14,
    previous: 9,
    device: 'Chrome 125',
    client: 'Windows',
  },
  {
    ipAddress: '192.0.2.45',
    ipType: IpType.datacenter,
    country: 'SG',
    region: 'Singapore',
    asn: 'AS13335 Cloudflare',
    riskScore: 74,
    current: 21,
    previous: 12,
    device: 'Node Fetch',
    client: 'Linux',
  },
  {
    ipAddress: '198.51.100.88',
    ipType: IpType.tor,
    country: 'JP',
    region: 'Tokyo',
    asn: 'AS2516 KDDI',
    riskScore: 91,
    current: 18,
    previous: 10,
    device: 'Firefox 126',
    client: 'Linux',
  },
  {
    ipAddress: '203.0.113.19',
    ipType: IpType.proxy,
    country: 'DE',
    region: 'Frankfurt',
    asn: 'AS3320 Deutsche Telekom',
    riskScore: 82,
    current: 16,
    previous: 8,
    device: 'Chrome 125',
    client: 'Windows',
  },
  {
    ipAddress: '198.51.100.61',
    ipType: IpType.vpn,
    country: 'PL',
    region: 'Warsaw',
    asn: 'AS5617 Orange Polska',
    riskScore: 79,
    current: 12,
    previous: 7,
    device: 'Safari 17',
    client: 'macOS',
  },
  {
    ipAddress: '203.0.113.160',
    ipType: IpType.residential,
    country: 'NL',
    region: 'Amsterdam',
    asn: 'AS1136 KPN',
    riskScore: 36,
    current: 15,
    previous: 13,
    device: 'Edge 125',
    client: 'Windows',
  },
  {
    ipAddress: '198.51.100.204',
    ipType: IpType.mobile,
    country: 'IN',
    region: 'Mumbai',
    asn: 'AS45609 Bharti Airtel',
    riskScore: 58,
    current: 11,
    previous: 6,
    device: 'Chrome Mobile',
    client: 'Android',
  },
  {
    ipAddress: '203.0.113.214',
    ipType: IpType.residential,
    country: 'ZA',
    region: 'Johannesburg',
    asn: 'AS10474 Dimension Data',
    riskScore: 48,
    current: 9,
    previous: 5,
    device: 'Chrome 124',
    client: 'Linux',
  },
] as const;

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed the admin dashboard.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const existingPlatform = await prisma.platform.findFirst({
      where: { domain: seedDomain },
    });
    const platform = existingPlatform
      ? await prisma.platform.update({
          where: { id: existingPlatform.id },
          data: {
            name: 'Acme Corp',
            status: PlatformStatus.active,
            strictnessLevel: StrictnessLevel.high,
          },
        })
      : await prisma.platform.create({
          data: {
            name: 'Acme Corp',
            domain: seedDomain,
            status: PlatformStatus.active,
            strictnessLevel: StrictnessLevel.high,
          },
        });

    await cleanupSeed(prisma, platform.id);

    const identityRecords = await Promise.all(
      identities.map(([email, fullName, trustStatus]) =>
        prisma.identity.upsert({
          where: { emailHash: hash(email) },
          update: {
            encryptedEmail: email,
            encryptedFullName: fullName,
            trustStatus,
            isHumanVerified: trustStatus === TrustStatus.verified,
          },
          create: {
            emailHash: hash(email),
            encryptedEmail: email,
            encryptedFullName: fullName,
            trustStatus,
            isHumanVerified: trustStatus === TrustStatus.verified,
          },
        }),
      ),
    );

    const ipRecords = await Promise.all(
      origins.map(async (origin) => {
        const existing = await prisma.ipRecord.findFirst({
          where: { ipAddress: origin.ipAddress },
        });

        const data = {
          ipType: origin.ipType,
          country: origin.country,
          region: origin.region,
          asn: origin.asn,
          riskScore: origin.riskScore,
          isBlacklisted: origin.riskScore >= 90,
          blacklistSource:
            origin.riskScore >= 90 ? 'admin-dashboard-seed' : null,
          lastEvaluatedAt: now,
        };

        if (existing) {
          return prisma.ipRecord.update({
            where: { id: existing.id },
            data,
          });
        }

        return prisma.ipRecord.create({
          data: {
            ipAddress: origin.ipAddress,
            ...data,
          },
        });
      }),
    );

    const devices = await Promise.all(
      origins.map(async (origin) => {
        const stableHash = hash(`${origin.device}:${origin.client}`).slice(
          0,
          16,
        );
        const existing = await prisma.device.findFirst({
          where: { stableHash },
        });

        if (existing) {
          return prisma.device.update({
            where: { id: existing.id },
            data: {
              riskScore: origin.riskScore,
              isFlagged: origin.riskScore >= 70,
            },
          });
        }

        return prisma.device.create({
          data: {
            stableHash,
            riskScore: origin.riskScore,
            isFlagged: origin.riskScore >= 70,
          },
        });
      }),
    );

    await prisma.platformUser.createMany({
      data: identityRecords.map((identity, index) => ({
        identityId: identity.id,
        platformId: platform.id,
        externalUserId: identities[index][0],
        statusOnPlatform:
          identity.trustStatus === 'blocked'
            ? PlatformUserStatus.blocked
            : identity.trustStatus === 'flagged' ||
                identity.trustStatus === 'limited'
              ? PlatformUserStatus.flagged
              : PlatformUserStatus.active,
        joinedAt: minutesAgo(120 + index * 17),
      })),
    });

    await seedEvents(prisma, platform.id, identityRecords, ipRecords, devices);
    await seedReviews(prisma, platform.id, identityRecords, ipRecords);
    await seedWebhooks(prisma, platform.id);
    await seedCertificates(prisma, identityRecords);
    await seedSessions(
      prisma,
      platform.id,
      identityRecords,
      ipRecords,
      devices,
    );

    console.log(
      `Seeded admin dashboard data for ${platform.name} (${platform.id}).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupSeed(prisma: PrismaClient, platformId: string) {
  const emailHashes = identities.map(([email]) => hash(email));
  const seedIdentityIds = (
    await prisma.identity.findMany({
      where: { emailHash: { in: emailHashes } },
      select: { id: true },
    })
  ).map((identity) => identity.id);

  await prisma.accessEvent.deleteMany({ where: { platformId } });
  await prisma.behavioralEvent.deleteMany({ where: { platformId } });
  await prisma.session.deleteMany({ where: { platformId } });
  await prisma.webhookDeliveryLog.deleteMany({ where: { platformId } });
  await prisma.verificationRequest.deleteMany({ where: { platformId } });
  await prisma.communityReport.deleteMany({
    where: { reportingPlatformId: platformId },
  });
  await prisma.platformUser.deleteMany({ where: { platformId } });

  if (seedIdentityIds.length === 0) {
    return;
  }

  const seedChecks = await prisma.backgroundCheck.findMany({
    where: { identityId: { in: seedIdentityIds } },
    select: { id: true },
  });
  const seedCheckIds = seedChecks.map((check) => check.id);

  if (seedCheckIds.length > 0) {
    const seedCertificates = await prisma.trustCertificate.findMany({
      where: { issuingCheckId: { in: seedCheckIds } },
      select: { id: true },
    });
    const seedCertificateIds = seedCertificates.map(
      (certificate) => certificate.id,
    );

    await prisma.identity.updateMany({
      where: { certificateId: { in: seedCertificateIds } },
      data: { certificateId: null },
    });
    await prisma.certificateVerification.deleteMany({
      where: { certificateId: { in: seedCertificateIds } },
    });
    await prisma.trustCertificate.deleteMany({
      where: { id: { in: seedCertificateIds } },
    });
    await prisma.backgroundCheckResult.deleteMany({
      where: { checkId: { in: seedCheckIds } },
    });
    await prisma.backgroundCheck.deleteMany({
      where: { id: { in: seedCheckIds } },
    });
  }
}

async function seedEvents(
  prisma: PrismaClient,
  platformId: string,
  identityRecords: Array<{ id: string }>,
  ipRecords: Array<{ id: string }>,
  devices: Array<{ id: string }>,
) {
  const latestRows = origins.slice(0, 6).map((origin, index) => ({
    origin,
    createdAt: minutesAgo([2, 3, 4, 5, 7, 9][index]),
    identityIndex: index,
  }));

  const latestEvents = latestRows.map(({ origin, createdAt, identityIndex }) =>
    createEvent({
      platformId,
      identityId: identityRecords[identityIndex % identityRecords.length].id,
      ipId: ipRecords[origins.indexOf(origin)].id,
      deviceId: devices[origins.indexOf(origin)].id,
      origin,
      createdAt,
      index: identityIndex,
    }),
  );

  const currentEvents = origins.flatMap((origin, originIndex) =>
    Array.from({ length: origin.current }, (_, index) =>
      createEvent({
        platformId,
        identityId:
          identityRecords[(originIndex + index) % identityRecords.length].id,
        ipId: ipRecords[originIndex].id,
        deviceId: devices[originIndex].id,
        origin,
        createdAt: minutesAgo(14 + originIndex * 19 + index * 23),
        index,
      }),
    ),
  );

  const previousEvents = origins.flatMap((origin, originIndex) =>
    Array.from({ length: origin.previous }, (_, index) =>
      createEvent({
        platformId,
        identityId:
          identityRecords[(originIndex + index + 2) % identityRecords.length]
            .id,
        ipId: ipRecords[originIndex].id,
        deviceId: devices[originIndex].id,
        origin,
        createdAt: minutesAgo(24 * 60 + 15 + originIndex * 17 + index * 29),
        index,
      }),
    ),
  );

  await prisma.accessEvent.createMany({
    data: [...latestEvents, ...currentEvents, ...previousEvents],
  });
}

function createEvent({
  platformId,
  identityId,
  ipId,
  deviceId,
  origin,
  createdAt,
  index,
}: {
  platformId: string;
  identityId: string;
  ipId: string;
  deviceId: string;
  origin: (typeof origins)[number];
  createdAt: Date;
  index: number;
}) {
  const eventType =
    index % 5 === 0
      ? AccessEventType.api_call
      : index % 3 === 0
        ? AccessEventType.page_visit
        : AccessEventType.login;

  return {
    platformId,
    identityId,
    ipId,
    deviceId,
    eventType,
    verdict: verdictForRisk(origin.riskScore),
    scoreAtEvent: trustScoreForRisk(origin.riskScore, index),
    triggeredRules: {
      device: origin.device,
      client: origin.client,
      matchedRule:
        origin.riskScore >= 75 ? 'new_asn_or_geo_velocity' : 'baseline_policy',
    },
    createdAt,
  };
}

async function seedReviews(
  prisma: PrismaClient,
  platformId: string,
  identityRecords: Array<{ id: string }>,
  ipRecords: Array<{ id: string }>,
) {
  await prisma.communityReport.createMany({
    data: [
      {
        reportingPlatformId: platformId,
        targetType: TargetType.ip,
        ipId: ipRecords[0].id,
        severity: ReportSeverity.high,
        category: ReportCategory.fraud,
        description: 'Critical login from new ASN',
        evidenceUrls: [],
        status: ReportStatus.pending,
        createdAt: minutesAgo(2),
      },
      {
        reportingPlatformId: platformId,
        targetType: TargetType.ip,
        ipId: ipRecords[7].id,
        severity: ReportSeverity.high,
        category: ReportCategory.scraping,
        description: 'High volume data export',
        evidenceUrls: [],
        status: ReportStatus.pending,
        createdAt: minutesAgo(11),
      },
      {
        reportingPlatformId: platformId,
        targetType: TargetType.identity,
        identityId: identityRecords[6].id,
        severity: ReportSeverity.medium,
        category: ReportCategory.bot,
        description: 'Unusual API activity',
        evidenceUrls: [],
        status: ReportStatus.pending,
        createdAt: minutesAgo(34),
      },
    ],
  });

  await prisma.verificationRequest.createMany({
    data: [
      {
        identityId: identityRecords[3].id,
        platformId,
        verificationType: VerificationType.liveness,
        provider: 'Persona',
        status: VerificationStatus.submitted,
        submittedAt: minutesAgo(11),
        createdAt: minutesAgo(11),
      },
      {
        identityId: identityRecords[6].id,
        platformId,
        verificationType: VerificationType.email,
        provider: 'TrustLayer',
        status: VerificationStatus.pending,
        createdAt: minutesAgo(26),
      },
    ],
  });
}

async function seedWebhooks(prisma: PrismaClient, platformId: string) {
  const logs = Array.from({ length: 72 }, (_, index) => {
    const failed = index % 17 === 0 || index % 29 === 0;
    return {
      platformId,
      eventType: index % 2 === 0 ? 'access.event.created' : 'review.created',
      payload: { latencyMs: 210 + ((index * 37) % 230) },
      responseStatus: failed ? 503 : 200,
      responseBody: failed ? 'Service unavailable' : 'OK',
      attemptNumber: failed ? 2 : 1,
      deliveredAt: failed ? null : minutesAgo(index * 19),
      createdAt: minutesAgo(index * 19),
    };
  });

  await prisma.webhookDeliveryLog.createMany({ data: logs });
}

async function seedCertificates(
  prisma: PrismaClient,
  identityRecords: Array<{ id: string }>,
) {
  for (let index = 0; index < identityRecords.length; index += 1) {
    const identity = identityRecords[index];
    const status =
      index % 5 === 0
        ? CertificateStatus.revoked
        : index % 4 === 0
          ? CertificateStatus.expired
          : CertificateStatus.active;
    const check = await prisma.backgroundCheck.create({
      data: {
        entityType: EntityType.identity,
        identityId: identity.id,
        triggeredBy: CheckTrigger.manual,
        overallVerdict:
          status === CertificateStatus.active
            ? CheckVerdict.clean
            : CheckVerdict.flagged,
        completedAt: minutesAgo(240 + index * 25),
      },
    });
    const certificate = await prisma.trustCertificate.create({
      data: {
        entityType: EntityType.identity,
        identityId: identity.id,
        issuedAt: minutesAgo(240 + index * 25),
        expiresAt:
          index % 3 === 0
            ? daysFromNow(7 + index)
            : status === CertificateStatus.expired
              ? daysFromNow(-3)
              : daysFromNow(90 + index * 12),
        status,
        revocationReason:
          status === CertificateStatus.revoked ? 'Seeded revocation' : null,
        certificateHash: `seed-admin-${hash(`${identity.id}:certificate`).slice(0, 24)}`,
        blockchainTxHash: `0x${hash(`${identity.id}:tx`)}`,
        issuingCheckId: check.id,
      },
    });

    if (status === CertificateStatus.active && index < 4) {
      await prisma.identity.update({
        where: { id: identity.id },
        data: { certificateId: certificate.id },
      });
    }
  }
}

async function seedSessions(
  prisma: PrismaClient,
  platformId: string,
  identityRecords: Array<{ id: string }>,
  ipRecords: Array<{ id: string }>,
  devices: Array<{ id: string }>,
) {
  await prisma.session.createMany({
    data: [0, 1, 2].map((index) => ({
      identityId: identityRecords[index].id,
      platformId,
      ipId: ipRecords[index].id,
      deviceId: devices[index].id,
      sessionTokenHash: hash(`seed-session-${index}`),
      riskScoreAtStart: 100 - origins[index].riskScore,
      sessionVerdict:
        origins[index].riskScore >= 75
          ? SessionVerdict.flagged
          : SessionVerdict.clean,
      startedAt: minutesAgo(18 + index * 7),
    })),
  });
}

function verdictForRisk(riskScore: number): AccessVerdict {
  if (riskScore >= 90) {
    return AccessVerdict.blocked;
  }

  if (riskScore >= 70) {
    return AccessVerdict.flagged;
  }

  if (riskScore >= 55) {
    return AccessVerdict.throttled;
  }

  return AccessVerdict.allowed;
}

function trustScoreForRisk(riskScore: number, index: number): number {
  const base = 100 - riskScore;
  return Math.max(8, Math.min(96, base + (index % 7) - 3));
}

function minutesAgo(minutes: number): Date {
  return new Date(now.getTime() - minutes * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

void main();
