import { DeviceSignalsRepository } from '../device-signals.repository';
import { DeviceSignal, RawSignalInput } from '../entities/device-signal.entity';

export async function storeDeviceSignals(
  repository: DeviceSignalsRepository,
  deviceId: string,
  signals: RawSignalInput[],
): Promise<DeviceSignal[]> {
  return repository.insertMany(signals.map((s) => ({ deviceId, ...s })));
}
