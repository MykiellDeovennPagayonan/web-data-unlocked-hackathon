import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { IdentitiesService } from '../identities/identities.service';
import { PlatformUsersRepository } from './platform-users.repository';
import { createPlatformUser } from './service-methods/create-platform-user';
import { getPlatformUserById } from './service-methods/get-platform-user-by-id';
import { updatePlatformUserStatus } from './service-methods/update-platform-user-status';
import { hashEmail } from '../../../common/crypto/hash';
import {
  CreatePlatformUserData,
  PlatformUser,
  UpdatePlatformUserData,
} from './entities/platform-user.entity';

/**
 * Hardcoded suspicious email domain blacklist.
 * In production this would be replaced by a Bright Data scraped dataset
 * or an external threat intelligence feed.
 */
const SUSPICIOUS_EMAIL_DOMAINS: Record<string, number> = {
  'test.com': 98,
  'example.com': 95,
  'fakeemail.com': 97,
  'mailinator.com': 96,
  'tempmail.com': 94,
  'guerrillamail.com': 93,
  'yopmail.com': 92,
  'throwaway.com': 91,
  'dispostable.com': 90,
  '10minutemail.com': 89,
};

export class SuspiciousEmailDomainError extends Error {
  constructor(
    public readonly domain: string,
    public readonly threatScore: number,
  ) {
    super('You have been flagged as a suspicious user.');
    this.name = 'SuspiciousEmailDomainError';
  }
}

export class SuspiciousEmailPatternError extends Error {
  constructor(
    public readonly pattern: string,
    public readonly threatScore: number,
  ) {
    super('You have been flagged as a suspicious user.');
    this.name = 'SuspiciousEmailPatternError';
  }
}

function checkEmailDomain(email: string): void {
  const domain = email.split('@')[1]?.toLowerCase();
  console.log(`[FLOW2] checkEmailDomain: email=${email}, domain=${domain}`);
  if (!domain) return;
  const threatScore = SUSPICIOUS_EMAIL_DOMAINS[domain];
  console.log(`[FLOW2] domain=${domain}, threatScore=${threatScore ?? 'none'}`);
  if (threatScore !== undefined) {
    console.log(`[FLOW2] BLOCKING domain=${domain} (score=${threatScore})`);
    throw new SuspiciousEmailDomainError(domain, threatScore);
  }
}

function checkEmailPattern(email: string): void {
  const localPart = email.split('@')[0]?.toLowerCase();
  console.log(
    `[FLOW2] checkEmailPattern: email=${email}, localPart=${localPart}`,
  );
  if (!localPart) return;
  if (localPart.includes('test')) {
    console.log(`[FLOW2] BLOCKING pattern 'test' in ${email}`);
    throw new SuspiciousEmailPatternError('test', 85);
  }
}

@Injectable()
export class PlatformUsersService {
  constructor(
    private readonly repository: PlatformUsersRepository,
    private readonly auditLogsService: AuditLogsService,
    private readonly identitiesService: IdentitiesService,
  ) {}

  async createPlatformUser(
    input: CreatePlatformUserData & {
      email?: string;
      encryptedEmail?: string;
      encryptedFullName?: string;
    },
  ): Promise<PlatformUser> {
    // If identityId provided, verify it exists before creating platform user
    if (input.identityId) {
      const identity = await this.identitiesService.getIdentityById(
        input.identityId,
      );
      if (!identity) {
        throw new Error(`Identity with id ${input.identityId} does not exist`);
      }
      return createPlatformUser(this.repository, this.auditLogsService, input);
    }

    // Otherwise, find or create identity based on email
    if (!input.email || !input.encryptedEmail || !input.encryptedFullName) {
      throw new Error(
        'Either identityId or email/encryptedEmail/encryptedFullName must be provided',
      );
    }

    console.log(`[FLOW2] createPlatformUser called with email=${input.email}`);

    // Check email domain against hardcoded suspicious domain list
    checkEmailDomain(input.email);

    // Check email local part for suspicious patterns
    checkEmailPattern(input.email);

    // Create a hash of the email for lookup
    const emailHash = hashEmail(input.email);

    // Use transaction to ensure atomicity of identity + platform user creation
    return this.repository.prisma.$transaction(async (tx) => {
      // Try to find existing identity by email hash
      let identity = await tx.identity.findUnique({
        where: { emailHash },
      });

      if (!identity) {
        // Create new identity if not found
        identity = await tx.identity.create({
          data: {
            emailHash,
            encryptedEmail: input.encryptedEmail!,
            encryptedFullName: input.encryptedFullName!,
            trustStatus: 'clean',
            isHumanVerified: false,
          },
        });
      }

      // Create platform user with the identity
      const platformUser = await tx.platformUser.create({
        data: {
          identityId: identity.id,
          platformId: input.platformId,
          externalUserId: input.externalUserId,
          statusOnPlatform: input.statusOnPlatform ?? 'active',
        },
      });

      // Log audit action
      await this.auditLogsService.logAction({
        actorType: 'system',
        actorId: 'system',
        action: 'identity_created',
        targetType: 'identity',
        targetId: identity.id,
        newValue: {
          trustStatus: identity.trustStatus,
          isHumanVerified: identity.isHumanVerified,
        },
      });

      await this.auditLogsService.logAction({
        actorType: 'system',
        actorId: 'system',
        action: 'platform_user_created',
        targetType: 'platform_user',
        targetId: platformUser.id,
        newValue: {
          platformId: platformUser.platformId,
          externalUserId: platformUser.externalUserId,
          statusOnPlatform: platformUser.statusOnPlatform,
        },
      });

      return platformUser;
    });
  }

  getPlatformUserById = (id: string): Promise<PlatformUser | null> =>
    getPlatformUserById(this.repository, id);

  getPlatformUserByExternalId = (
    platformId: string,
    externalUserId: string,
  ): Promise<PlatformUser | null> =>
    this.repository.findByExternalId(platformId, externalUserId);

  updatePlatformUserStatus = (
    id: string,
    status: UpdatePlatformUserData['statusOnPlatform'],
  ): Promise<PlatformUser> =>
    updatePlatformUserStatus(
      this.repository,
      this.auditLogsService,
      id,
      status,
    );
}
