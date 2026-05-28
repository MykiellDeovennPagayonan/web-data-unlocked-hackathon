import { Injectable } from '@nestjs/common';
import { ReportStatus, VerificationStatus } from '../../generated/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { DashboardRecords } from './admin-dashboard.types';

const dayMs = 24 * 60 * 60 * 1000;

@Injectable()
export class AdminDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardRecords(platformId?: string): Promise<DashboardRecords> {
    const platform = await this.resolvePlatform(platformId);

    if (!platform) {
      return {
        platform: null,
        currentEvents: [],
        previousEvents: [],
        latestEvents: [],
        identityCount: 0,
        currentIdentityJoins: [],
        previousIdentityJoins: [],
        webhookLogs: [],
        pendingReports: [],
        pendingVerifications: [],
        certificates: [],
        activeSessions: 0,
      };
    }

    const now = new Date();
    const currentStart = new Date(now.getTime() - dayMs);
    const previousStart = new Date(now.getTime() - dayMs * 2);

    const [
      currentEvents,
      previousEvents,
      latestEvents,
      identityCount,
      currentPlatformUsers,
      previousPlatformUsers,
      webhookLogs,
      pendingReports,
      pendingVerifications,
      certificates,
      activeSessions,
    ] = await Promise.all([
      this.prisma.accessEvent.findMany({
        where: {
          platformId: platform.id,
          createdAt: { gte: currentStart },
        },
        include: {
          identity: { select: { id: true, encryptedEmail: true } },
          org: { select: { id: true, legalName: true } },
          ip: {
            select: {
              id: true,
              ipAddress: true,
              country: true,
              region: true,
              asn: true,
              riskScore: true,
            },
          },
          device: { select: { id: true, stableHash: true, riskScore: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      this.prisma.accessEvent.findMany({
        where: {
          platformId: platform.id,
          createdAt: { gte: previousStart, lt: currentStart },
        },
        include: {
          identity: { select: { id: true, encryptedEmail: true } },
          org: { select: { id: true, legalName: true } },
          ip: {
            select: {
              id: true,
              ipAddress: true,
              country: true,
              region: true,
              asn: true,
              riskScore: true,
            },
          },
          device: { select: { id: true, stableHash: true, riskScore: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),
      this.prisma.accessEvent.findMany({
        where: { platformId: platform.id },
        include: {
          identity: { select: { id: true, encryptedEmail: true } },
          org: { select: { id: true, legalName: true } },
          ip: {
            select: {
              id: true,
              ipAddress: true,
              country: true,
              region: true,
              asn: true,
              riskScore: true,
            },
          },
          device: { select: { id: true, stableHash: true, riskScore: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.prisma.identity.count({
        where: { platformUsers: { some: { platformId: platform.id } } },
      }),
      this.prisma.platformUser.findMany({
        where: {
          platformId: platform.id,
          joinedAt: { gte: currentStart },
        },
        select: { joinedAt: true },
        take: 5000,
      }),
      this.prisma.platformUser.findMany({
        where: {
          platformId: platform.id,
          joinedAt: { gte: previousStart, lt: currentStart },
        },
        select: { joinedAt: true },
        take: 5000,
      }),
      this.prisma.webhookDeliveryLog.findMany({
        where: {
          platformId: platform.id,
          createdAt: { gte: previousStart },
        },
        orderBy: { createdAt: 'asc' },
        take: 2000,
      }),
      this.prisma.communityReport.findMany({
        where: {
          reportingPlatformId: platform.id,
          status: ReportStatus.pending,
        },
        include: {
          ip: { select: { ipAddress: true } },
          identity: { select: { encryptedEmail: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.verificationRequest.findMany({
        where: {
          platformId: platform.id,
          status: {
            in: [VerificationStatus.pending, VerificationStatus.submitted],
          },
        },
        include: {
          identity: { select: { encryptedEmail: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      this.prisma.trustCertificate.findMany({
        select: { status: true, expiresAt: true },
        take: 5000,
      }),
      this.prisma.session.count({
        where: {
          platformId: platform.id,
          endedAt: null,
        },
      }),
    ]);

    return {
      platform,
      currentEvents,
      previousEvents,
      latestEvents,
      identityCount,
      currentIdentityJoins: currentPlatformUsers.map((user) => user.joinedAt),
      previousIdentityJoins: previousPlatformUsers.map((user) => user.joinedAt),
      webhookLogs,
      pendingReports,
      pendingVerifications,
      certificates,
      activeSessions,
    };
  }

  private async resolvePlatform(platformId?: string) {
    if (platformId) {
      return this.prisma.platform.findUnique({
        where: { id: platformId },
        select: { id: true, name: true, domain: true },
      });
    }

    return this.prisma.platform.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, domain: true },
    });
  }
}
