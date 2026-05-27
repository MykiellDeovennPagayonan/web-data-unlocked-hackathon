import { DevicesRepository } from '../devices.repository';
import { Device } from '../entities/device.entity';

export async function updateDeviceRiskScore(
  repository: DevicesRepository,
  id: string,
  riskScore: number,
): Promise<Device> {
  return repository.update(id, { riskScore });
}
