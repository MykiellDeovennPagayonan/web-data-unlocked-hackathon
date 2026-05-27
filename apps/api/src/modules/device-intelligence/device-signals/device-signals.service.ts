import { Injectable } from '@nestjs/common';
import { DeviceSignalsRepository } from './device-signals.repository';
import { storeDeviceSignals } from './service-methods/store-device-signals';
import { getSignalsByDevice } from './service-methods/get-signals-by-device';
import { DeviceSignal, RawSignalInput } from './entities/device-signal.entity';

@Injectable()
export class DeviceSignalsService {
  constructor(private readonly repository: DeviceSignalsRepository) {}

  storeDeviceSignals = (
    deviceId: string,
    signals: RawSignalInput[],
  ): Promise<DeviceSignal[]> =>
    storeDeviceSignals(this.repository, deviceId, signals);

  getSignalsByDevice = (deviceId: string): Promise<DeviceSignal[]> =>
    getSignalsByDevice(this.repository, deviceId);
}
