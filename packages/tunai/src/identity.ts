import { post } from "./fetch"
import type { TunaiConfig, Identity, PlatformUser, EnrolledUser } from "./types"

export function enrollIndividual(
  config: TunaiConfig,
  params: { email: string; fullName: string; externalUserId: string }
): Promise<EnrolledUser> {
  return post<Identity>(config, "/admin/identities", {
    email: params.email,
    encryptedEmail: params.email,
    encryptedFullName: params.fullName,
  }).then((identity) =>
    post<PlatformUser>(config, "/v1/platform-users", {
      identityId: identity.id,
      externalUserId: params.externalUserId,
    }).then((platformUser) => ({
      identityId: identity.id,
      platformUserId: platformUser.id,
    }))
  )
}
