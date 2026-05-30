import { post } from "./fetch"
import type { TunaiConfig, IpRecord, IpVelocity, IpProbe } from "./types"

export function lookupIp(config: TunaiConfig, ipAddress: string): Promise<IpRecord> {
  return post<IpRecord>(config, "/v1/intelligence/ip", { ipAddress })
}

export function trackRequestVelocity(config: TunaiConfig, ipAddress: string): Promise<IpVelocity> {
  return post<IpVelocity>(config, "/v1/intelligence/ip/velocity", { ipAddress })
}

export function trackIpProbe(config: TunaiConfig, ipAddress: string, endpointSignature: string): Promise<IpProbe> {
  return post<IpProbe>(config, "/v1/intelligence/ip/probe", { ipAddress, endpointSignature })
}
