import { DevicesRepository } from '../devices.repository';
import { Device } from '../entities/device.entity';

export async function getDeviceById(
  repository: DevicesRepository,
  id: string,
): Promise<Device | null> {
  return repository.findById(id);
}
