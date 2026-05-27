-- CreateEnum
CREATE TYPE "TrustStatus" AS ENUM ('clean', 'flagged', 'limited', 'blocked', 'verified');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('identity', 'organization');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('identity', 'organization', 'ip', 'email', 'device');

-- CreateEnum
CREATE TYPE "PlatformStatus" AS ENUM ('active', 'suspended', 'trial');

-- CreateEnum
CREATE TYPE "StrictnessLevel" AS ENUM ('low', 'medium', 'high', 'custom');

-- CreateEnum
CREATE TYPE "RuleTrigger" AS ENUM ('registration', 'login', 'payment', 'data_export', 'api_call');

-- CreateEnum
CREATE TYPE "RuleAction" AS ENUM ('block', 'flag', 'throttle', 'require_reverification');

-- CreateEnum
CREATE TYPE "PlatformUserStatus" AS ENUM ('active', 'flagged', 'blocked');

-- CreateEnum
CREATE TYPE "AliasType" AS ENUM ('email', 'ip', 'device', 'phone', 'username');

-- CreateEnum
CREATE TYPE "AliasSource" AS ENUM ('behavioral', 'background_check', 'manual', 'ml_inference');

-- CreateEnum
CREATE TYPE "DeviceSignalType" AS ENUM ('user_agent', 'os', 'browser', 'screen_resolution', 'timezone', 'language', 'canvas_hash', 'webgl_hash');

-- CreateEnum
CREATE TYPE "IpType" AS ENUM ('residential', 'datacenter', 'vpn', 'tor', 'proxy', 'mobile');

-- CreateEnum
CREATE TYPE "AccessEventType" AS ENUM ('registration', 'login', 'api_call', 'page_visit');

-- CreateEnum
CREATE TYPE "AccessVerdict" AS ENUM ('allowed', 'flagged', 'throttled', 'blocked');

-- CreateEnum
CREATE TYPE "SessionVerdict" AS ENUM ('clean', 'flagged', 'terminated');

-- CreateEnum
CREATE TYPE "BehavioralEventType" AS ENUM ('api_call', 'endpoint_probe', 'scrape_pattern', 'rapid_action', 'permission_violation');

-- CreateEnum
CREATE TYPE "BehavioralActionTaken" AS ENUM ('none', 'throttled', 'session_limited', 'blocked', 'reverification_required');

-- CreateEnum
CREATE TYPE "CheckTrigger" AS ENUM ('registration', 'manual', 'periodic_refresh', 'community_report');

-- CreateEnum
CREATE TYPE "CheckVerdict" AS ENUM ('clean', 'flagged', 'blocked');

-- CreateEnum
CREATE TYPE "CheckSource" AS ENUM ('linkedin', 'crunchbase', 'ofac', 'opensanctions', 'news', 'serp', 'social_media', 'glassdoor', 'business_registry');

-- CreateEnum
CREATE TYPE "NormalizedVerdict" AS ENUM ('clear', 'soft_flag', 'hard_flag', 'not_found');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('linkedin_verified', 'vpn_detected', 'ofac_match', 'community_report', 'clean_history', 'behavioral_flag', 'kyc_passed');

-- CreateEnum
CREATE TYPE "SignalSource" AS ENUM ('background_check', 'behavioral', 'community_report', 'ml', 'manual');

-- CreateEnum
CREATE TYPE "SnapshotReason" AS ENUM ('background_check', 'behavioral_flag', 'community_report', 'certificate_issued', 'manual_review', 'signal_expired');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('active', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "CertificateVerificationVerdict" AS ENUM ('valid', 'expired', 'revoked', 'not_found');

-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('blacklist', 'whitelist');

-- CreateEnum
CREATE TYPE "RegistrySeverity" AS ENUM ('yellow_soft', 'orange_watch', 'red_hard');

-- CreateEnum
CREATE TYPE "RegistrySourceType" AS ENUM ('external_db', 'behavioral', 'community_report', 'manual');

-- CreateEnum
CREATE TYPE "ReportSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('fraud', 'bot', 'scraping', 'spam', 'identity_theft', 'other');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('platform', 'identity', 'system', 'admin');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('data_processing', 'background_check', 'cross_platform_sharing', 'marketing');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('email', 'phone', 'government_id', 'liveness', 'business_docs');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'submitted', 'approved', 'rejected', 'expired');

-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "PlatformStatus" NOT NULL,
    "strictnessLevel" "StrictnessLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" JSONB NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_rules" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "ruleTrigger" "RuleTrigger" NOT NULL,
    "conditionJson" JSONB NOT NULL,
    "action" "RuleAction" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_delivery_logs" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "responseBody" TEXT,
    "attemptNumber" INTEGER NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identities" (
    "id" TEXT NOT NULL,
    "emailHash" TEXT NOT NULL,
    "encryptedEmail" TEXT NOT NULL,
    "encryptedFullName" TEXT NOT NULL,
    "trustStatus" "TrustStatus" NOT NULL,
    "isHumanVerified" BOOLEAN NOT NULL DEFAULT false,
    "certificateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_users" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "statusOnPlatform" "PlatformUserStatus" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "trustStatus" "TrustStatus" NOT NULL,
    "certificateId" TEXT,
    "submittedByPlatformId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_aliases" (
    "id" TEXT NOT NULL,
    "canonicalEntityType" "EntityType" NOT NULL,
    "canonicalEntityId" TEXT NOT NULL,
    "aliasType" "AliasType" NOT NULL,
    "aliasValueHash" TEXT NOT NULL,
    "aliasValueEncrypted" TEXT NOT NULL,
    "confidence" DECIMAL(65,30) NOT NULL,
    "source" "AliasSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "stableHash" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "riskScore" DECIMAL(65,30) NOT NULL,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_signals" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "signalType" "DeviceSignalType" NOT NULL,
    "value" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_records" (
    "id" TEXT NOT NULL,
    "ipAddress" INET NOT NULL,
    "ipType" "IpType" NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "asn" TEXT NOT NULL,
    "riskScore" DECIMAL(65,30) NOT NULL,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistSource" TEXT,
    "lastEvaluatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ip_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_events" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "identityId" TEXT,
    "orgId" TEXT,
    "ipId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "eventType" "AccessEventType" NOT NULL,
    "verdict" "AccessVerdict" NOT NULL,
    "scoreAtEvent" DECIMAL(65,30) NOT NULL,
    "triggeredRules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "ipId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "riskScoreAtStart" DECIMAL(65,30) NOT NULL,
    "riskScoreAtEnd" DECIMAL(65,30),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "sessionVerdict" "SessionVerdict" NOT NULL,
    "terminationReason" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "eventType" "BehavioralEventType" NOT NULL,
    "endpoint" TEXT NOT NULL,
    "flagTriggered" BOOLEAN NOT NULL DEFAULT false,
    "flagType" TEXT,
    "actionTaken" "BehavioralActionTaken" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavioral_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_checks" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "identityId" TEXT,
    "orgId" TEXT,
    "triggeredBy" "CheckTrigger" NOT NULL,
    "overallVerdict" "CheckVerdict" NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "background_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_check_results" (
    "id" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "source" "CheckSource" NOT NULL,
    "rawResult" JSONB NOT NULL,
    "normalizedVerdict" "NormalizedVerdict" NOT NULL,
    "confidenceScore" DECIMAL(65,30) NOT NULL,
    "llmSummary" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "background_check_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_signals" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "identityId" TEXT,
    "orgId" TEXT,
    "signalType" "SignalType" NOT NULL,
    "weight" DECIMAL(65,30) NOT NULL,
    "source" "SignalSource" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_score_snapshots" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "identityId" TEXT,
    "orgId" TEXT,
    "score" DECIMAL(65,30) NOT NULL,
    "snapshotReason" "SnapshotReason" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_certificates" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "identityId" TEXT,
    "orgId" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "CertificateStatus" NOT NULL,
    "revocationReason" TEXT,
    "certificateHash" TEXT NOT NULL,
    "blockchainTxHash" TEXT NOT NULL,
    "issuingCheckId" TEXT NOT NULL,

    CONSTRAINT "trust_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_verifications" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "verifiedByPlatformId" TEXT NOT NULL,
    "verdict" "CertificateVerificationVerdict" NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registry_entries" (
    "id" TEXT NOT NULL,
    "listType" "ListType" NOT NULL,
    "severity" "RegistrySeverity" NOT NULL,
    "sourceType" "RegistrySourceType" NOT NULL,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registry_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registry_targets" (
    "id" TEXT NOT NULL,
    "registryEntryId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "identityId" TEXT,
    "orgId" TEXT,
    "ipId" TEXT,
    "deviceId" TEXT,
    "emailHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registry_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_reports" (
    "id" TEXT NOT NULL,
    "reportingPlatformId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "identityId" TEXT,
    "orgId" TEXT,
    "ipId" TEXT,
    "emailHash" TEXT,
    "severity" "ReportSeverity" NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrls" JSONB NOT NULL,
    "status" "ReportStatus" NOT NULL,
    "registryEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "consentVersion" TEXT NOT NULL,
    "ipAtConsent" INET NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "identityId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "verificationType" "VerificationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "identities_emailHash_key" ON "identities"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_domain_key" ON "organizations"("domain");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_rules" ADD CONSTRAINT "platform_rules_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_delivery_logs" ADD CONSTRAINT "webhook_delivery_logs_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identities" ADD CONSTRAINT "identities_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "trust_certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_users" ADD CONSTRAINT "platform_users_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_users" ADD CONSTRAINT "platform_users_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "trust_certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_submittedByPlatformId_fkey" FOREIGN KEY ("submittedByPlatformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_aliases" ADD CONSTRAINT "entity_aliases_identity_fk" FOREIGN KEY ("canonicalEntityId") REFERENCES "identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_aliases" ADD CONSTRAINT "entity_aliases_org_fk" FOREIGN KEY ("canonicalEntityId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_signals" ADD CONSTRAINT "device_signals_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ip_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_events" ADD CONSTRAINT "access_events_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ip_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_events" ADD CONSTRAINT "behavioral_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_events" ADD CONSTRAINT "behavioral_events_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_events" ADD CONSTRAINT "behavioral_events_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_check_results" ADD CONSTRAINT "background_check_results_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "background_checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_signals" ADD CONSTRAINT "trust_signals_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_signals" ADD CONSTRAINT "trust_signals_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_score_snapshots" ADD CONSTRAINT "trust_score_snapshots_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_score_snapshots" ADD CONSTRAINT "trust_score_snapshots_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_certificates" ADD CONSTRAINT "trust_certificates_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_certificates" ADD CONSTRAINT "trust_certificates_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_certificates" ADD CONSTRAINT "trust_certificates_issuingCheckId_fkey" FOREIGN KEY ("issuingCheckId") REFERENCES "background_checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_verifications" ADD CONSTRAINT "certificate_verifications_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "trust_certificates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_verifications" ADD CONSTRAINT "certificate_verifications_verifiedByPlatformId_fkey" FOREIGN KEY ("verifiedByPlatformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_targets" ADD CONSTRAINT "registry_targets_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "registry_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_targets" ADD CONSTRAINT "registry_targets_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_targets" ADD CONSTRAINT "registry_targets_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_targets" ADD CONSTRAINT "registry_targets_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ip_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_targets" ADD CONSTRAINT "registry_targets_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reportingPlatformId_fkey" FOREIGN KEY ("reportingPlatformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_ipId_fkey" FOREIGN KEY ("ipId") REFERENCES "ip_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_registryEntryId_fkey" FOREIGN KEY ("registryEntryId") REFERENCES "registry_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
