import { geoRiskLevelFromRiskScore } from './admin-dashboard-analytics';

export type GeoRiskLevel = 'low' | 'medium' | 'high';

export interface GeoCoordinateInput {
  country: string;
  region?: string | null;
}

export interface GeoCoordinate {
  label: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  source: 'region' | 'country' | 'unknown';
}

export interface ProjectedGeoCoordinate {
  x: number;
  y: number;
}

export interface GeoEventOrigin {
  ipAddress: string;
  country: string;
  region?: string | null;
  asn: string;
  riskScore: number;
  events: number;
}

export interface GeoActivityPoint
  extends GeoCoordinate, ProjectedGeoCoordinate {
  id: string;
  location: string;
  ipAddress: string;
  asn: string;
  riskScore: number;
  riskLevel: GeoRiskLevel;
  events: number;
}

export interface GeoAttackFlow {
  id: string;
  sourceLocation: string;
  targetLocation: string;
  source: ProjectedGeoCoordinate;
  target: ProjectedGeoCoordinate;
  riskLevel: Exclude<GeoRiskLevel, 'low'>;
  events: number;
}

export interface GeoActivity {
  points: GeoActivityPoint[];
  attackFlows: GeoAttackFlow[];
  legendCounts: Record<GeoRiskLevel | 'attackFlow', number>;
  callout: GeoActivityPoint | null;
}

const regionCoordinates: Record<string, Omit<GeoCoordinate, 'source'>> = {
  'BR:Sao Paulo': coordinate(
    'Sao Paulo, BR',
    'BR',
    'Sao Paulo',
    -23.5505,
    -46.6333,
  ),
  'CA:Toronto': coordinate('Toronto, CA', 'CA', 'Toronto', 43.6532, -79.3832),
  'DE:Frankfurt': coordinate(
    'Frankfurt, DE',
    'DE',
    'Frankfurt',
    50.1109,
    8.6821,
  ),
  'GB:London': coordinate('London, GB', 'GB', 'London', 51.5072, -0.1276),
  'IN:Mumbai': coordinate('Mumbai, IN', 'IN', 'Mumbai', 19.076, 72.8777),
  'JP:Tokyo': coordinate('Tokyo, JP', 'JP', 'Tokyo', 35.6762, 139.6503),
  'NL:Amsterdam': coordinate(
    'Amsterdam, NL',
    'NL',
    'Amsterdam',
    52.3676,
    4.9041,
  ),
  'PL:Warsaw': coordinate('Warsaw, PL', 'PL', 'Warsaw', 52.2297, 21.0122),
  'RU:Moscow': coordinate('Moscow, RU', 'RU', 'Moscow', 55.7558, 37.6173),
  'SG:Singapore': coordinate(
    'Singapore, SG',
    'SG',
    'Singapore',
    1.3521,
    103.8198,
  ),
  'US:Ashburn': coordinate('Ashburn, US', 'US', 'Ashburn', 39.0438, -77.4874),
  'US:New York': coordinate('New York, US', 'US', 'New York', 40.7128, -74.006),
  'US:San Francisco': coordinate(
    'San Francisco, US',
    'US',
    'San Francisco',
    37.7749,
    -122.4194,
  ),
  'ZA:Johannesburg': coordinate(
    'Johannesburg, ZA',
    'ZA',
    'Johannesburg',
    -26.2041,
    28.0473,
  ),
};

const countryCoordinates: Record<string, Omit<GeoCoordinate, 'source'>> = {
  AU: coordinate('Australia', 'AU', 'Australia', -25.2744, 133.7751),
  BR: coordinate('Brazil', 'BR', 'Brazil', -14.235, -51.9253),
  CA: coordinate('Canada', 'CA', 'Canada', 56.1304, -106.3468),
  DE: coordinate('Germany', 'DE', 'Germany', 51.1657, 10.4515),
  GB: coordinate('United Kingdom', 'GB', 'United Kingdom', 55.3781, -3.436),
  IN: coordinate('India', 'IN', 'India', 20.5937, 78.9629),
  JP: coordinate('Japan', 'JP', 'Japan', 36.2048, 138.2529),
  NL: coordinate('Netherlands', 'NL', 'Netherlands', 52.1326, 5.2913),
  PL: coordinate('Poland', 'PL', 'Poland', 51.9194, 19.1451),
  RU: coordinate('Russia', 'RU', 'Russia', 61.524, 105.3188),
  SG: coordinate('Singapore', 'SG', 'Singapore', 1.3521, 103.8198),
  US: coordinate('United States', 'US', 'United States', 39.8283, -98.5795),
  ZA: coordinate('South Africa', 'ZA', 'South Africa', -30.5595, 22.9375),
};

export function resolveGeoCoordinate(input: GeoCoordinateInput): GeoCoordinate {
  const country = normalizeCountry(input.country);
  const region = normalizeRegion(input.region);
  const exact = region ? regionCoordinates[`${country}:${region}`] : undefined;

  if (exact) {
    return { ...exact, source: 'region' };
  }

  const countryFallback = countryCoordinates[country];
  if (countryFallback) {
    return { ...countryFallback, source: 'country' };
  }

  return {
    label: region ? `${region}, ${country || 'Unknown'}` : country || 'Unknown',
    country: country || 'Unknown',
    region: region || 'Unknown',
    latitude: 0,
    longitude: 0,
    source: 'unknown',
  };
}

export function projectGeoCoordinate({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): ProjectedGeoCoordinate {
  const clampedLatitude = clamp(latitude, -85.05112878, 85.05112878);
  const x = ((longitude + 180) / 360) * 1000;
  const latitudeRadians = (clampedLatitude * Math.PI) / 180;
  const mercatorY =
    (1 -
      Math.log(Math.tan(latitudeRadians) + 1 / Math.cos(latitudeRadians)) /
        Math.PI) /
    2;

  return {
    x: roundCoordinate(clamp(x, 0, 1000)),
    y: roundCoordinate(clamp(mercatorY * 360, 0, 360)),
  };
}

export function buildGeoActivity(
  origins: GeoEventOrigin[],
  destinationInput: GeoCoordinateInput = {
    country: 'US',
    region: 'San Francisco',
  },
): GeoActivity {
  const points = origins
    .map((origin) => {
      const coordinate = resolveGeoCoordinate(origin);
      const projected = projectGeoCoordinate(coordinate);

      return {
        id: `${coordinate.country}-${coordinate.region}-${origin.ipAddress}`,
        location: coordinate.label,
        ipAddress: origin.ipAddress,
        asn: origin.asn,
        riskScore: origin.riskScore,
        riskLevel: geoRiskLevelFromRiskScore(origin.riskScore),
        events: origin.events,
        ...coordinate,
        ...projected,
      };
    })
    .sort((left, right) => right.events - left.events);

  const destination = resolveGeoCoordinate(destinationInput);
  const target = projectGeoCoordinate(destination);
  const attackFlowSources = points
    .filter((point) => point.riskLevel !== 'low')
    .sort((left, right) => {
      if (right.riskScore !== left.riskScore) {
        return right.riskScore - left.riskScore;
      }
      return right.events - left.events;
    })
    .slice(0, 4);

  const attackFlows = attackFlowSources.map((source) => ({
    id: `${source.id}-to-${destination.country}-${destination.region}`,
    sourceLocation: source.label,
    targetLocation: destination.label,
    source: { x: source.x, y: source.y },
    target,
    riskLevel: source.riskLevel as Exclude<GeoRiskLevel, 'low'>,
    events: source.events,
  }));

  return {
    points,
    attackFlows,
    legendCounts: {
      low: points.filter((point) => point.riskLevel === 'low').length,
      medium: points.filter((point) => point.riskLevel === 'medium').length,
      high: points.filter((point) => point.riskLevel === 'high').length,
      attackFlow: attackFlows.length,
    },
    callout:
      points.find((point) => point.riskLevel === 'high') ??
      points.find((point) => point.riskLevel === 'medium') ??
      points[0] ??
      null,
  };
}

function coordinate(
  label: string,
  country: string,
  region: string,
  latitude: number,
  longitude: number,
): Omit<GeoCoordinate, 'source'> {
  return { label, country, region, latitude, longitude };
}

function normalizeCountry(country: string): string {
  return country.trim().toUpperCase();
}

function normalizeRegion(region: string | null | undefined): string {
  return (region ?? '').trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}
