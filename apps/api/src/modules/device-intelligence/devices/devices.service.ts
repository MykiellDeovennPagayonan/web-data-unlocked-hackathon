import { Injectable } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { DeviceSignalsRepository } from '../device-signals/device-signals.repository';
import { resolveOrCreateDevice } from './service-methods/resolve-or-create-device';
import { getDeviceById } from './service-methods/get-device-by-id';
import { updateDeviceRiskScore } from './service-methods/update-device-risk-score';
import { flagDevice } from './service-methods/flag-device';
import { Device } from './entities/device.entity';
import { RawSignalInput } from '../device-signals/entities/device-signal.entity';

@Injectable()
export class DevicesService {
  constructor(
    private readonly repository: DevicesRepository,
    private readonly signalsRepository: DeviceSignalsRepository,
  ) {}

  resolveOrCreateDevice = (
    signals: RawSignalInput[],
  ): Promise<{ device: Device; isNew: boolean }> =>
    resolveOrCreateDevice(this.repository, this.signalsRepository, signals);

  getDeviceById = (id: string): Promise<Device | null> =>
    getDeviceById(this.repository, id);

  updateDeviceRiskScore = (id: string, riskScore: number): Promise<Device> =>
    updateDeviceRiskScore(this.repository, id, riskScore);

  flagDevice = (id: string, isFlagged: boolean): Promise<Device> =>
    flagDevice(this.repository, id, isFlagged);
}
