import type { TunaiConfig } from "./types"
import { lookupIp, trackRequestVelocity } from "./ip"
import { resolveDevice } from "./device"
import { enrollIndividual } from "./identity"
import { enrollOrganization } from "./organization"
import { getPlatformUser } from "./platform-user"
import { getTrustScore } from "./trust-score"
import { runBackgroundCheck, getBackgroundCheck } from "./background-check"
import { submitCommunityReport } from "./community-report"

export type { TunaiConfig }

export function createClient(config: TunaiConfig) {
  const c = config
  return {
    lookupIp: (ipAddress: string) => lookupIp(c, ipAddress),
    trackRequestVelocity: (ipAddress: string) => trackRequestVelocity(c, ipAddress),
    resolveDevice: (signals: Parameters<typeof resolveDevice>[1]) => resolveDevice(c, signals),
    enrollIndividual: (params: Parameters<typeof enrollIndividual>[1]) => enrollIndividual(c, params),
    enrollOrganization: (params: Parameters<typeof enrollOrganization>[1]) => enrollOrganization(c, params),
    getPlatformUser: (externalUserId: string) => getPlatformUser(c, externalUserId),
    getTrustScore: (entityType: Parameters<typeof getTrustScore>[1], entityId: string) => getTrustScore(c, entityType, entityId),
    runBackgroundCheck: (params: Parameters<typeof runBackgroundCheck>[1]) => runBackgroundCheck(c, params),
    getBackgroundCheck: (checkId: string) => getBackgroundCheck(c, checkId),
    submitCommunityReport: (params: Parameters<typeof submitCommunityReport>[1]) => submitCommunityReport(c, params),
  }
}

export type TunaiClient = ReturnType<typeof createClient>
