import { get } from "./fetch"
import type { TunaiConfig, TrustScore, EntityType } from "./types"

export function getTrustScore(
  config: TunaiConfig,
  entityType: EntityType,
  entityId: string
): Promise<TrustScore> {
  return get<TrustScore>(config, `/v1/trust-score/${entityType}/${entityId}`)
}
