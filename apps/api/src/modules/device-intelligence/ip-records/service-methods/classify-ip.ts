import { IpType } from '../../../../generated/client';
import { IpClassification } from '../entities/ip-record.entity';

const TOR_EXIT_NODE_ASNS = new Set(['AS65535', 'AS64496']);
const DATACENTER_ASNS = new Set([
  'AS16509',
  'AS14618',
  'AS15169',
  'AS8075',
  'AS20940',
]);
const VPN_INDICATORS = ['vpn', 'nordvpn', 'expressvpn', 'pia', 'mullvad'];

function detectIpType(ipAddress: string, asn: string): IpType {
  const asnUpper = asn.toUpperCase();
  if (TOR_EXIT_NODE_ASNS.has(asnUpper)) return IpType.tor;
  if (DATACENTER_ASNS.has(asnUpper)) return IpType.datacenter;
  const asnLower = asn.toLowerCase();
  if (VPN_INDICATORS.some((v) => asnLower.includes(v))) return IpType.vpn;

  const parts = ipAddress.split('.');
  const firstOctet = parseInt(parts[0] ?? '0', 10);
  if (firstOctet >= 100 && firstOctet <= 109) return IpType.datacenter;

  return IpType.residential;
}

function computeIpRiskScore(ipType: IpType): number {
  const scores: Record<IpType, number> = {
    [IpType.tor]: 90,
    [IpType.vpn]: 60,
    [IpType.proxy]: 70,
    [IpType.datacenter]: 40,
    [IpType.mobile]: 10,
    [IpType.residential]: 5,
  };
  return scores[ipType] ?? 5;
}

export function classifyIp(ipAddress: string): IpClassification {
  const asn = 'AS00000';
  const ipType = detectIpType(ipAddress, asn);
  const riskScore = computeIpRiskScore(ipType);
  return {
    ipType,
    riskScore,
    country: 'UNKNOWN',
    region: 'UNKNOWN',
    asn,
  };
}
