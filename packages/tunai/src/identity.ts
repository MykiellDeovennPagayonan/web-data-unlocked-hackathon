import { post } from "./fetch"
import type { TunaiConfig, PlatformUser, EnrolledUser } from "./types"

export function enrollIndividual(
  config: TunaiConfig,
  params: { email: string; fullName: string; externalUserId: string }
): Promise<EnrolledUser> {
  // Single call to platform-users - backend handles identity creation internally
  return post<PlatformUser>(config, "/v1/platform-users", {
    platformId: config.platformId,
    externalUserId: params.externalUserId,
    email: params.email,
    encryptedEmail: params.email,
    encryptedFullName: params.fullName,
  }).then((platformUser) => {
    if (!platformUser.identityId) {
      throw new Error("Platform user created without identity")
    }
    return {
      identityId: platformUser.identityId,
      platformUserId: platformUser.id,
    }
  })
}
