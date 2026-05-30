import type { TunaiConfig } from "./types"
import { lookupIp, trackRequestVelocity, trackIpProbe } from "./ip"
import { resolveDevice } from "./device"
import { enrollIndividual } from "./identity"
import { enrollOrganization } from "./organization"
import { getPlatformUser } from "./platform-user"
import { getTrustScore } from "./trust-score"
import { runBackgroundCheck, getBackgroundCheck } from "./background-check"
import { submitCommunityReport } from "./community-report"
import { logAccessEvent } from "./access-event"
import { verifyCertificate } from "./certificate"
import type { LogAccessEventParams } from "./access-event"

export type { TunaiConfig, LogAccessEventParams }

export function createClient(config: TunaiConfig) {
  const c = config
  return {
    lookupIp: (ipAddress: string) => lookupIp(c, ipAddress),
    trackRequestVelocity: (ipAddress: string) => trackRequestVelocity(c, ipAddress),
    trackIpProbe: (ipAddress: string, endpointSignature: string) => trackIpProbe(c, ipAddress, endpointSignature),
    logAccessEvent: (params: LogAccessEventParams) => logAccessEvent(c, params),
    resolveDevice: (signals: Parameters<typeof resolveDevice>[1], identityId?: string) => resolveDevice(c, signals, identityId),
    enrollIndividual: (params: Parameters<typeof enrollIndividual>[1]) => enrollIndividual(c, params),
    enrollOrganization: (params: Parameters<typeof enrollOrganization>[1]) => enrollOrganization(c, params),
    getPlatformUser: (externalUserId: string) => getPlatformUser(c, externalUserId),
    getTrustScore: (entityType: Parameters<typeof getTrustScore>[1], entityId: string) => getTrustScore(c, entityType, entityId),
    runBackgroundCheck: (params: Parameters<typeof runBackgroundCheck>[1]) => runBackgroundCheck(c, params),
    getBackgroundCheck: (checkId: string) => getBackgroundCheck(c, checkId),
    submitCommunityReport: (params: Parameters<typeof submitCommunityReport>[1]) => submitCommunityReport(c, params),
    verifyCertificate: (certificateHash: string, verifiedByPlatformId: string) => verifyCertificate(c, certificateHash, verifiedByPlatformId),
  }
}

export type TunaiClient = ReturnType<typeof createClient>
