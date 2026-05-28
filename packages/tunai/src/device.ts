import { post } from "./fetch"
import type { TunaiConfig, Device, DeviceSignal } from "./types"

export interface DeviceResolution {
  device: Device
  isNew: boolean
}

export function resolveDevice(
  config: TunaiConfig,
  signals: DeviceSignal[]
): Promise<DeviceResolution> {
  return post<DeviceResolution>(config, "/v1/intelligence/device", { signals })
}
