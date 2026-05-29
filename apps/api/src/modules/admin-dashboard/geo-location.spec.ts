import {
  buildGeoActivity,
  projectGeoCoordinate,
  resolveGeoCoordinate,
} from './geo-location';

describe('admin dashboard geographic activity', () => {
  it('resolves known backend country and region fields to real coordinates', () => {
    const coordinate = resolveGeoCoordinate({
      country: 'RU',
      region: 'Moscow',
    });

    expect(coordinate).toMatchObject({
      label: 'Moscow, RU',
      latitude: 55.7558,
      longitude: 37.6173,
      source: 'region',
    });
  });

  it('projects coordinates onto the dashboard map without using arbitrary points', () => {
    const moscow = projectGeoCoordinate({
      latitude: 55.7558,
      longitude: 37.6173,
    });
    const sanFrancisco = projectGeoCoordinate({
      latitude: 37.7749,
      longitude: -122.4194,
    });

    expect(moscow.x).toBeCloseTo(604.49, 1);
    expect(moscow.y).toBeCloseTo(112.54, 1);
    expect(sanFrancisco.x).toBeCloseTo(159.95, 1);
    expect(sanFrancisco.y).toBeCloseTo(139.15, 1);
  });

  it('builds low, medium, high, and attack-flow map data from backend event origins', () => {
    const activity = buildGeoActivity(
      [
        {
          ipAddress: '203.0.113.45',
          country: 'RU',
          region: 'Moscow',
          asn: 'AS8359 MTS',
          riskScore: 96,
          events: 1283,
        },
        {
          ipAddress: '198.51.100.23',
          country: 'US',
          region: 'New York',
          asn: 'AS15169 Google',
          riskScore: 42,
          events: 781,
        },
        {
          ipAddress: '45.73.32.11',
          country: 'SG',
          region: 'Singapore',
          asn: 'AS13335 Cloudflare',
          riskScore: 68,
          events: 321,
        },
      ],
      { country: 'US', region: 'San Francisco' },
    );

    expect(activity.points).toHaveLength(3);
    expect(activity.legendCounts).toEqual({
      low: 1,
      medium: 1,
      high: 1,
      attackFlow: 2,
    });
    expect(
      activity.points.find((point) => point.location === 'Moscow, RU'),
    ).toMatchObject({
      riskLevel: 'high',
      latitude: 55.7558,
      longitude: 37.6173,
      events: 1283,
    });
    expect(activity.attackFlows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceLocation: 'Moscow, RU',
          targetLocation: 'San Francisco, US',
        }),
      ]),
    );
    expect(activity.callout).toMatchObject({
      location: 'Moscow, RU',
      riskLevel: 'high',
      events: 1283,
    });
  });
});
