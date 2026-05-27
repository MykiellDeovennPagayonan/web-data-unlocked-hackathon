import { PrismaService } from '../../src/prisma/prisma.service';

export class TestDataTracker {
  platforms: string[] = [];
  identities: string[] = [];
  organizations: string[] = [];
  apiKeys: string[] = [];
  platformRules: string[] = [];
  entityAliases: string[] = [];
  platformUsers: string[] = [];
  webhookLogs: string[] = [];
  devices: string[] = [];
  ipRecords: string[] = [];
  backgroundChecks: string[] = [];
  trustSignals: string[] = [];

  trackPlatform(id: string) {
    this.platforms.push(id);
  }

  trackIdentity(id: string) {
    this.identities.push(id);
  }

  trackOrganization(id: string) {
    this.organizations.push(id);
  }

  trackApiKey(id: string) {
    this.apiKeys.push(id);
  }

  trackPlatformRule(id: string) {
    this.platformRules.push(id);
  }

  trackEntityAlias(id: string) {
    this.entityAliases.push(id);
  }

  trackPlatformUser(id: string) {
    this.platformUsers.push(id);
  }

  trackWebhookLog(id: string) {
    this.webhookLogs.push(id);
  }

  trackDevice(id: string) {
    this.devices.push(id);
  }

  trackIpRecord(id: string) {
    this.ipRecords.push(id);
  }

  trackBackgroundCheck(id: string) {
    this.backgroundChecks.push(id);
  }

  trackTrustSignal(id: string) {
    this.trustSignals.push(id);
  }

  async cleanup(prisma: PrismaService): Promise<void> {
    // Delete in reverse dependency order to satisfy FK constraints
    if (this.entityAliases.length > 0) {
      await prisma.entityAlias.deleteMany({
        where: { id: { in: this.entityAliases } },
      });
    }
    if (this.platformUsers.length > 0) {
      await prisma.platformUser.deleteMany({
        where: { id: { in: this.platformUsers } },
      });
    }
    // Delete all api_keys and platform_rules for tracked platforms (catches untracked ones from presets/rotations)
    if (this.platforms.length > 0) {
      await prisma.apiKey.deleteMany({
        where: { platformId: { in: this.platforms } },
      });
      await prisma.platformRule.deleteMany({
        where: { platformId: { in: this.platforms } },
      });
      await prisma.webhookDeliveryLog.deleteMany({
        where: { platformId: { in: this.platforms } },
      });
    }
    if (this.apiKeys.length > 0) {
      await prisma.apiKey.deleteMany({
        where: { id: { in: this.apiKeys } },
      });
    }
    if (this.platformRules.length > 0) {
      await prisma.platformRule.deleteMany({
        where: { id: { in: this.platformRules } },
      });
    }
    if (this.webhookLogs.length > 0) {
      await prisma.webhookDeliveryLog.deleteMany({
        where: { id: { in: this.webhookLogs } },
      });
    }
    if (this.organizations.length > 0) {
      await prisma.organization.deleteMany({
        where: { id: { in: this.organizations } },
      });
    }
    if (this.identities.length > 0) {
      await prisma.platformUser.deleteMany({
        where: { identityId: { in: this.identities } },
      });
      await prisma.identity.deleteMany({
        where: { id: { in: this.identities } },
      });
    }
    if (this.trustSignals.length > 0) {
      await prisma.trustSignal.deleteMany({
        where: { id: { in: this.trustSignals } },
      });
    }
    if (this.backgroundChecks.length > 0) {
      await prisma.backgroundCheckResult.deleteMany({
        where: { checkId: { in: this.backgroundChecks } },
      });
      await prisma.backgroundCheck.deleteMany({
        where: { id: { in: this.backgroundChecks } },
      });
    }
    if (this.devices.length > 0) {
      await prisma.deviceSignal.deleteMany({
        where: { deviceId: { in: this.devices } },
      });
      await prisma.device.deleteMany({
        where: { id: { in: this.devices } },
      });
    }
    if (this.ipRecords.length > 0) {
      await prisma.ipRecord.deleteMany({
        where: { id: { in: this.ipRecords } },
      });
    }
    if (this.platforms.length > 0) {
      await prisma.platform.deleteMany({
        where: { id: { in: this.platforms } },
      });
    }
  }
}
