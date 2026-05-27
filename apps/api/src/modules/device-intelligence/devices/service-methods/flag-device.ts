import { DevicesRepository } from '../devices.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { Device } from '../entities/device.entity';

export async function flagDevice(
  repository: DevicesRepository,
  auditLogsService: AuditLogsService,
  id: string,
  isFlagged: boolean,
): Promise<Device> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Device not found: ${id}`);
  }

  const updated = await repository.update(id, { isFlagged });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'device_flag_toggled',
    targetType: 'device',
    targetId: id,
    oldValue: { isFlagged: old.isFlagged },
    newValue: { isFlagged: updated.isFlagged },
  });

  return updated;
}
