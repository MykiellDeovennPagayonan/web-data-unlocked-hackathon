import { get } from "./fetch"
import type { TunaiConfig, PlatformUser } from "./types"

export function getPlatformUser(
  config: TunaiConfig,
  externalUserId: string
): Promise<PlatformUser> {
  return get<PlatformUser>(config, `/v1/platform-users/${externalUserId}`)
}
