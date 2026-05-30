import { post } from "./fetch"
import type { TunaiConfig } from "./types"

export interface LogAccessEventParams {
  platformId: string
  ipId: string
  deviceId?: string
  eventType: "api_call" | "page_visit" | "login" | "registration"
  verdict: "allowed" | "flagged" | "throttled" | "blocked"
  scoreAtEvent: number
  identityId?: string
  orgId?: string
  triggeredRules?: Record<string, unknown>
}

export interface AccessEvent {
  id: string
  platformId: string
  identityId: string | null
  orgId: string | null
  ipId: string
  deviceId: string | null
  eventType: string
  verdict: string
  scoreAtEvent: number
  triggeredRules: object
  createdAt: string
}

export function logAccessEvent(config: TunaiConfig, params: LogAccessEventParams): Promise<AccessEvent> {
  return post<AccessEvent>(config, "/v1/access/events", params)
}
