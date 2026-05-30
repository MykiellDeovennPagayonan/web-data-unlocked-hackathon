import * as crypto from 'crypto';
import { DevicesRepository } from '../devices.repository';
import { DeviceSignalsRepository } from '../../device-signals/device-signals.repository';
import { EntityAliasesRepository } from '../../../identity/entity-aliases/entity-aliases.repository';
import { TrustSignalsService } from '../../../trust-engine/trust-signals/trust-signals.service';
import { Device } from '../entities/device.entity';
import { RawSignalInput } from '../../device-signals/entities/device-signal.entity';
import {
  DeviceSignalType,
  AliasType,
  AliasSource,
  EntityType,
  SignalType,
  SignalSource,
} from '../../../../generated/client';

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
  entityAliasesRepository: EntityAliasesRepository,
  trustSignalsService: TrustSignalsService,
  signals: RawSignalInput[],
  identityId?: string,
): Promise<{ device: Device; isNew: boolean }> {
  const stableHash = computeStableHash(signals);

  const existing = await devicesRepository.findByStableHash(stableHash);
  if (existing) {
    await devicesRepository.update(existing.id, { lastSeenAt: new Date() });
    await signalsRepository.insertMany(
      signals.map((s) => ({ deviceId: existing.id, ...s })),
    );

    if (identityId) {
      const existingAlias = await entityAliasesRepository.findByAlias(
        AliasType.device,
        stableHash,
      );

      if (!existingAlias) {
        // First identity for this device: create self-referencing alias
        await entityAliasesRepository.insert({
          canonicalEntityType: EntityType.identity,
          canonicalEntityId: identityId,
          aliasType: AliasType.device,
          aliasValueHash: stableHash,
          aliasValueEncrypted: '',
          confidence: 1.0,
          source: AliasSource.behavioral,
          identityId,
        });
      } else if (existingAlias.canonicalEntityId !== identityId) {
        // New identity using a known device
        const canonicalId = existingAlias.canonicalEntityId;

        await entityAliasesRepository.insert({
          canonicalEntityType: EntityType.identity,
          canonicalEntityId: canonicalId,
          aliasType: AliasType.device,
          aliasValueHash: stableHash,
          aliasValueEncrypted: '',
          confidence: 0.95,
          source: AliasSource.behavioral,
          identityId,
        });

        const allAliases = await entityAliasesRepository.findByEntity(
          EntityType.identity,
          canonicalId,
        );
        const crossAliases = allAliases.filter(
          (a) => a.identityId !== canonicalId,
        );
        const realAliasCount = crossAliases.length;

        // Signal current identity with cumulative penalty
        await trustSignalsService.createTrustSignal({
          entityType: EntityType.identity,
          identityId,
          signalType: SignalType.behavioral_flag,
          weight: -realAliasCount * 20,
          source: SignalSource.behavioral,
          referenceId: existingAlias.id,
        });
      }
    }

    return { device: existing, isNew: false };
  }

  const device = await devicesRepository.insert({ stableHash, riskScore: 0 });
  await signalsRepository.insertMany(
    signals.map((s) => ({ deviceId: device.id, ...s })),
  );

  if (identityId) {
    // First identity for this new device: create self-referencing alias
    await entityAliasesRepository.insert({
      canonicalEntityType: EntityType.identity,
      canonicalEntityId: identityId,
      aliasType: AliasType.device,
      aliasValueHash: stableHash,
      aliasValueEncrypted: '',
      confidence: 1.0,
      source: AliasSource.behavioral,
      identityId,
    });
  }

  return { device, isNew: true };
}
