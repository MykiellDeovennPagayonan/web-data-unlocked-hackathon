import * as crypto from 'crypto';
import { DevicesRepository } from '../devices.repository';
import { DeviceSignalsRepository } from '../../device-signals/device-signals.repository';
import { Device } from '../entities/device.entity';
import { RawSignalInput } from '../../device-signals/entities/device-signal.entity';
import { DeviceSignalType } from '../../../../generated/client';

const STABLE_SIGNAL_TYPES: DeviceSignalType[] = [
  DeviceSignalType.canvas_hash,
  DeviceSignalType.webgl_hash,
  DeviceSignalType.screen_resolution,
  DeviceSignalType.os,
  DeviceSignalType.timezone,
];

export function computeStableHash(signals: RawSignalInput[]): string {
  const stableSignals = signals
    .filter((s) => STABLE_SIGNAL_TYPES.includes(s.signalType))
    .sort((a, b) => a.signalType.localeCompare(b.signalType))
    .map((s) => `${s.signalType}:${s.value}`)
    .join('|');
  return crypto.createHash('sha256').update(stableSignals).digest('hex');
}

export async function resolveOrCreateDevice(
  devicesRepository: DevicesRepository,
  signalsRepository: DeviceSignalsRepository,
  signals: RawSignalInput[],
): Promise<{ device: Device; isNew: boolean }> {
  const stableHash = computeStableHash(signals);

  const existing = await devicesRepository.findByStableHash(stableHash);
  if (existing) {
    await devicesRepository.update(existing.id, { lastSeenAt: new Date() });
    await signalsRepository.insertMany(
      signals.map((s) => ({ deviceId: existing.id, ...s })),
    );
    return { device: existing, isNew: false };
  }

  const device = await devicesRepository.insert({ stableHash, riskScore: 0 });
  await signalsRepository.insertMany(
    signals.map((s) => ({ deviceId: device.id, ...s })),
  );
  return { device, isNew: true };
}
