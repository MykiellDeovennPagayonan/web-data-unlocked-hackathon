import {
  DeviceSignal as PrismaDeviceSignal,
  DeviceSignalType,
} from '../../../../generated/client';

export type DeviceSignal = PrismaDeviceSignal;

export interface CreateDeviceSignalData {
  deviceId: string;
  signalType: DeviceSignalType;
  value: string;
}

export interface RawSignalInput {
  signalType: DeviceSignalType;
  value: string;
}
