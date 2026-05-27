import { DevicesRepository } from '../devices.repository';
import { Device } from '../entities/device.entity';

export async function flagDevice(
  repository: DevicesRepository,
  id: string,
  isFlagged: boolean,
): Promise<Device> {
  return repository.update(id, { isFlagged });
}
