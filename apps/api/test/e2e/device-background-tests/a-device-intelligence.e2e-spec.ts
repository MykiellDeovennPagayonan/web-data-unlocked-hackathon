import request from 'supertest';
import { createTestApp, TestApp } from '../../helpers/setup-e2e';
import { TestDataTracker } from '../../helpers/test-data-tracker';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('A. Device Intelligence (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;
  let apiKey: string;
  let platformId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();

    const res = await request(testApp.app.getHttpServer())
      .post('/admin/platforms')
      .send({
        name: 'Test Platform Device',
        domain: 'device.example.com',
        status: 'trial',
        strictnessLevel: 'medium',
      });

    expect(res.status).toBe(201);
    platformId = res.body.id;
    tracker.trackPlatform(platformId);

    const keyResult = await testApp.apiKeysService.createApiKey(platformId, {
      platformId,
      name: 'Bootstrap Key',
      scopes: ['read', 'write'],
    });
    apiKey = keyResult.rawKey;
    tracker.trackApiKey(keyResult.apiKey.id);
  });

  afterAll(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('A.1 Devices', () => {
    const baseSignals = [
      { signalType: 'canvas_hash', value: unique('canvas') },
      { signalType: 'webgl_hash', value: unique('webgl') },
      { signalType: 'screen_resolution', value: '2560x1440' },
      { signalType: 'os', value: 'macOS' },
      { signalType: 'timezone', value: 'Asia/Manila' },
    ];

    let deviceId: string;
    let stableHash: string;

    it('A.1.1 resolves a new device', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', apiKey)
        .send({
          signals: [
            ...baseSignals,
            {
              signalType: 'user_agent',
              value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            },
            { signalType: 'browser', value: 'Chrome' },
            { signalType: 'language', value: 'en-US' },
          ],
        })
        .expect(201);

      expect(res.body.device).toBeDefined();
      expect(res.body.isNew).toBe(true);
      expect(Number(res.body.device.riskScore)).toBe(0);
      expect(Boolean(res.body.device.isFlagged)).toBe(false);
      expect(res.body.device.stableHash).toMatch(/^[a-f0-9]{64}$/);

      deviceId = res.body.device.id;
      stableHash = res.body.device.stableHash;
      tracker.trackDevice(deviceId);
    });

    it('A.1.2 resolves an existing device with drifted non-stable signals', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', apiKey)
        .send({
          signals: [
            ...baseSignals,
            {
              signalType: 'user_agent',
              value:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            },
            { signalType: 'browser', value: 'Chrome' },
            { signalType: 'language', value: 'en-US' },
          ],
        })
        .expect(201);

      expect(res.body.isNew).toBe(false);
      expect(res.body.device.id).toBe(deviceId);
      expect(res.body.device.stableHash).toBe(stableHash);
      expect(
        new Date(res.body.device.lastSeenAt).getTime(),
      ).toBeGreaterThanOrEqual(new Date(res.body.device.firstSeenAt).getTime());
    });

    it('A.1.3 resolves a new device when stable signals change', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', apiKey)
        .send({
          signals: [
            { signalType: 'canvas_hash', value: unique('canvas2') },
            { signalType: 'webgl_hash', value: unique('webgl2') },
            { signalType: 'screen_resolution', value: '1920x1080' },
            { signalType: 'os', value: 'Windows' },
            { signalType: 'timezone', value: 'America/New_York' },
            { signalType: 'user_agent', value: 'Mozilla/5.0' },
            { signalType: 'browser', value: 'Firefox' },
            { signalType: 'language', value: 'en-US' },
          ],
        })
        .expect(201);

      expect(res.body.isNew).toBe(true);
      expect(res.body.device.id).not.toBe(deviceId);
      expect(res.body.device.stableHash).not.toBe(stableHash);

      tracker.trackDevice(res.body.device.id);
    });

    it('A.1.4 gets device by id (admin)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/devices/${deviceId}`)
        .expect(200);

      expect(res.body.id).toBe(deviceId);
      expect(res.body.stableHash).toBe(stableHash);
    });

    it('A.1.5 returns null for non-existent device', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/devices/00000000-0000-0000-0000-000000000000')
        .expect(200);

      expect(res.body === null || JSON.stringify(res.body) === '{}').toBe(true);
    });

    it('A.1.6 updates device risk score via service', async () => {
      const updated = await testApp.devicesService.updateDeviceRiskScore(
        deviceId,
        75,
      );
      expect(Number(updated.riskScore)).toBe(75);

      const fetchRes = await request(testApp.app.getHttpServer())
        .get(`/admin/devices/${deviceId}`)
        .expect(200);

      expect(Number(fetchRes.body.riskScore)).toBe(75);
    });

    it('A.1.7 flags device via service', async () => {
      const updated = await testApp.devicesService.flagDevice(deviceId, true);
      expect(updated.isFlagged).toBe(true);

      const fetchRes = await request(testApp.app.getHttpServer())
        .get(`/admin/devices/${deviceId}`)
        .expect(200);

      expect(fetchRes.body.isFlagged).toBe(true);
    });

    it('A.1.8 rejects missing api key', async () => {
      await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .send({ signals: baseSignals })
        .expect(401);
    });

    it('A.1.9 rejects invalid api key', async () => {
      await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', 'invalid-key-123')
        .send({ signals: baseSignals })
        .expect(401);
    });
  });

  describe('A.2 IP Records', () => {
    let ipId: string;

    const testIp = `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

    it('A.2.1 looks up a new IPv4 address', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/ip')
        .set('x-api-key', apiKey)
        .send({ ipAddress: testIp })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.ipAddress).toBe(testIp);
      expect(res.body).toHaveProperty('ipType');
      expect(res.body).toHaveProperty('riskScore');
      expect(res.body).toHaveProperty('lastEvaluatedAt');

      ipId = res.body.id;
      tracker.trackIpRecord(ipId);
    });

    it('A.2.2 looks up existing IP and updates timestamp', async () => {
      const before = await request(testApp.app.getHttpServer())
        .get(`/admin/ip/${testIp}`)
        .expect(200);

      const res = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/ip')
        .set('x-api-key', apiKey)
        .send({ ipAddress: testIp })
        .expect(201);

      expect(res.body.id).toBe(ipId);
      expect(
        new Date(res.body.lastEvaluatedAt).getTime(),
      ).toBeGreaterThanOrEqual(new Date(before.body.lastEvaluatedAt).getTime());
    });

    it('A.2.3 looks up an IPv6 address', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/ip')
        .set('x-api-key', apiKey)
        .send({ ipAddress: '2001:4860:4860::8888' })
        .expect(201);

      expect(res.body.ipAddress).toBe('2001:4860:4860::8888');
      tracker.trackIpRecord(res.body.id);
    });

    it('A.2.4 rejects invalid IP address', async () => {
      await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/ip')
        .set('x-api-key', apiKey)
        .send({ ipAddress: 'not-an-ip' })
        .expect(500);
    });

    it('A.2.5 gets IP record by IP (admin)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/ip/${testIp}`)
        .expect(200);

      expect(res.body.ipAddress).toBe(testIp);
      expect(res.body.id).toBe(ipId);
    });

    it('A.2.6 rejects missing api key', async () => {
      await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/ip')
        .send({ ipAddress: '8.8.8.8' })
        .expect(401);
    });
  });
});
