import { post, get } from "./fetch"
import type { TunaiConfig, BackgroundCheck, EntityType, CheckTrigger } from "./types"

export interface RunBackgroundCheckParams {
  entityType: EntityType
  identityId?: string
  orgId?: string
  triggeredBy?: CheckTrigger
  entityName?: string
}

export function runBackgroundCheck(
  config: TunaiConfig,
  params: RunBackgroundCheckParams
): Promise<BackgroundCheck> {
  return post<BackgroundCheck>(config, "/v1/background-checks/run", {
    entityType: params.entityType,
    identityId: params.identityId,
    orgId: params.orgId,
    triggeredBy: params.triggeredBy ?? "registration",
    entityName: params.entityName,
  })
}

export function getBackgroundCheck(
  config: TunaiConfig,
  checkId: string
): Promise<BackgroundCheck> {
  return get<BackgroundCheck>(config, `/v1/background-checks/${checkId}`)
}
