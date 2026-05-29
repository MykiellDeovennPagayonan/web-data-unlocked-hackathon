import { post } from "./fetch"
import type { TunaiConfig, IpRecord, IpVelocity } from "./types"

export function lookupIp(config: TunaiConfig, ipAddress: string): Promise<IpRecord> {
  return post<IpRecord>(config, "/v1/intelligence/ip", { ipAddress })
}

export function trackRequestVelocity(config: TunaiConfig, ipAddress: string): Promise<IpVelocity> {
  return post<IpVelocity>(config, "/v1/intelligence/ip/velocity", { ipAddress })
}
