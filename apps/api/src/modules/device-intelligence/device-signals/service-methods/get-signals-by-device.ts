import { DeviceSignalsRepository } from '../device-signals.repository';
import { DeviceSignal } from '../entities/device-signal.entity';

export async function getSignalsByDevice(
  repository: DeviceSignalsRepository,
  deviceId: string,
): Promise<DeviceSignal[]> {
  return repository.findByDevice(deviceId);
}
