import {
  Device as PrismaDevice,
  DeviceSignal as PrismaDeviceSignal,
} from '../../../../generated/client';

export type Device = PrismaDevice;
export type DeviceSignal = PrismaDeviceSignal;

export interface CreateDeviceData {
  stableHash: string;
  riskScore?: number;
  isFlagged?: boolean;
}

export interface UpdateDeviceData {
  lastSeenAt?: Date;
  riskScore?: number;
  isFlagged?: boolean;
}
