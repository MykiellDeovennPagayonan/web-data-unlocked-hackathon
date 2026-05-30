import { post } from "./fetch"
import type { TunaiConfig, Organization, PlatformUser, EnrolledOrganization } from "./types"

export interface OrgDetails {
  legalName: string
  domain: string
  registrationNumber: string
  country: string
  industry: string
}

export function enrollOrganization(
  config: TunaiConfig,
  params: OrgDetails & { externalUserId: string }
): Promise<EnrolledOrganization> {
  const { externalUserId, ...orgDetails } = params
  return post<Organization>(config, "/v1/organizations", orgDetails).then((org) =>
    post<PlatformUser>(config, "/v1/platform-users", {
      identityId: org.id,
      externalUserId,
      platformId: config.platformId,
    }).then((platformUser) => ({
      orgId: org.id,
      platformUserId: platformUser.id,
    }))
  )
}
