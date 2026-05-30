import request from 'supertest';
import { createTestApp, TestApp } from '../helpers/setup-e2e';
import { TestDataTracker } from '../helpers/test-data-tracker';

describe('Admin List Endpoints (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;
  let platformId: string;
  let apiKey: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();

    // Seed a platform
    const platformRes = await request(testApp.app.getHttpServer())
      .post('/admin/platforms')
      .send({
        name: 'Test Admin Platform',
        domain: 'admin-list-test.local',
        status: 'active',
        strictnessLevel: 'medium',
      });
    expect(platformRes.status).toBe(201);
    platformId = platformRes.body.id;
    tracker.trackPlatform(platformId);

    const keyResult = await testApp.apiKeysService.createApiKey(platformId, {
      name: 'Bootstrap Key',
      platformId,
      scopes: ['read', 'write'],
    });
    apiKey = keyResult.rawKey;
    tracker.trackApiKey(keyResult.apiKey.id);

    // Seed an identity
    const identityRes = await request(testApp.app.getHttpServer())
      .post('/admin/identities')
      .send({
        email: 'test1@admin.local',
        encryptedEmail: 'test1@admin.local',
        encryptedFullName: 'Test User One',
      });
    expect(identityRes.status).toBe(201);
    tracker.trackIdentity(identityRes.body.id);

    // Seed an organization
    const orgRes = await request(testApp.app.getHttpServer())
      .post('/admin/organizations')
      .send({
        legalName: 'Test Org One',
        domain: 'test-org.local',
        registrationNumber: 'REG-001',
        country: 'US',
        industry: 'tech',
        trustStatus: 'clean',
        submittedByPlatformId: platformId,
      });
    expect(orgRes.status).toBe(201);
    tracker.trackOrganization(orgRes.body.id);

    // Seed a device via v1 endpoint
    const deviceRes = await request(testApp.app.getHttpServer())
      .post('/v1/intelligence/device')
      .set('x-api-key', apiKey)
      .send({
        signals: [
          { signalType: 'canvas_hash', value: 'admin-test-device-1' },
          { signalType: 'webgl_hash', value: 'admin-test-webgl' },
          { signalType: 'screen_resolution', value: '1920x1080' },
          { signalType: 'os', value: 'macOS' },
          { signalType: 'timezone', value: 'Asia/Manila' },
          { signalType: 'user_agent', value: 'Mozilla/5.0' },
          { signalType: 'browser', value: 'Chrome' },
          { signalType: 'language', value: 'en-US' },
        ],
      });
    expect(deviceRes.status).toBe(201);
    tracker.trackDevice(deviceRes.body.device.id);

    // Seed an IP record via v1 endpoint
    const ipRes = await request(testApp.app.getHttpServer())
      .post('/v1/intelligence/ip')
      .set('x-api-key', apiKey)
      .send({ ipAddress: '192.168.99.1' });
    expect(ipRes.status).toBe(201);
    tracker.trackIpRecord(ipRes.body.id);

    // Seed a background check first (required FK for trust certificate)
    const bcRes = await request(testApp.app.getHttpServer())
      .post('/v1/background-checks')
      .set('x-api-key', apiKey)
      .send({
        entityType: 'identity',
        identityId: identityRes.body.id,
        triggeredBy: 'registration',
      });
    expect(bcRes.status).toBe(201);
    const checkId = bcRes.body.id;
    tracker.trackBackgroundCheck(checkId);

    // Seed a trust certificate via Prisma (no public create endpoint)
    const cert = await testApp.prisma.trustCertificate.create({
      data: {
        entityType: 'identity',
        identityId: identityRes.body.id,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        status: 'active',
        certificateHash: 'cert-hash-001',
        blockchainTxHash: '0xabc123',
        issuingCheckId: checkId,
      },
    });
    tracker.trackTrustCertificate(cert.id);

    // Seed a verification request via v1 endpoint
    const verifRes = await request(testApp.app.getHttpServer())
      .post('/v1/compliance/verification-requests')
      .set('x-api-key', apiKey)
      .send({
        identityId: identityRes.body.id,
        platformId,
        verificationType: 'email',
        provider: 'Tunai',
      });
    expect(verifRes.status).toBe(201);
    tracker.trackVerificationRequest(verifRes.body.id);

    // Seed a community report via v1 endpoint
    const reportRes = await request(testApp.app.getHttpServer())
      .post('/v1/registry/community-reports')
      .set('x-api-key', apiKey)
      .send({
        reportingPlatformId: platformId,
        targetType: 'ip',
        ipId: ipRes.body.id,
        severity: 'high',
        category: 'fraud',
        description: 'Suspicious activity',
        evidenceUrls: [],
      });
    expect(reportRes.status).toBe(201);
    tracker.trackCommunityReport(reportRes.body.id);

    // Seed a webhook log via Prisma (no public create endpoint)
    const webhookLog = await testApp.prisma.webhookDeliveryLog.create({
      data: {
        platformId,
        eventType: 'access.event.created',
        payload: { test: true },
        responseStatus: 200,
        responseBody: 'OK',
        attemptNumber: 1,
        deliveredAt: new Date(),
      },
    });
    tracker.trackWebhookLog(webhookLog.id);
  });

  afterAll(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('GET /admin/identities', () => {
    it('returns 200 and a list of identities', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/identities')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const identity = res.body.find(
        (i: { encryptedEmail: string }) => i.encryptedEmail === 'test1@admin.local',
      );
      expect(identity).toBeDefined();
      expect(identity).toHaveProperty('trustStatus');
      expect(identity).toHaveProperty('createdAt');
    });

    it('supports pagination with take and skip', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/identities?take=1&skip=0')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(1);
    });

    it('returns empty array when skip exceeds total', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/identities?take=10&skip=99999')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /admin/organizations', () => {
    it('returns 200 and a list of organizations', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/organizations')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const org = res.body.find(
        (o: { domain: string }) => o.domain === 'test-org.local',
      );
      expect(org).toBeDefined();
      expect(org).toHaveProperty('legalName', 'Test Org One');
    });

    it('supports pagination', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/organizations?take=1')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/devices', () => {
    it('returns 200 and a list of devices', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/devices')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const device = res.body[0];
    });

    it('supports pagination', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/devices?take=1&skip=0')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/ip-records', () => {
    it('returns 200 and a list of IP records', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/ip-records')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const ip = res.body.find(
        (r: { ipAddress: string }) => r.ipAddress === '192.168.99.1',
      );
      expect(ip).toBeDefined();
      expect(ip).toHaveProperty('ipType');
    });

    it('supports pagination', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/ip-records?take=1')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/trust-certificates', () => {
    it('returns 200 and a list of certificates', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/trust-certificates')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const cert = res.body.find(
        (c: { certificateHash: string }) =>
          c.certificateHash === 'cert-hash-001',
      );
      expect(cert).toBeDefined();
      expect(cert).toHaveProperty('status', 'active');
    });

    it('supports pagination', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/trust-certificates?take=1')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/compliance/verification-requests', () => {
    it('returns 200 and a list of verification requests', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/compliance/verification-requests')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const req = res.body.find(
        (r: { verificationType: string }) => r.verificationType === 'email',
      );
      expect(req).toBeDefined();
      expect(req).toHaveProperty('status', 'pending');
    });

    it('supports pagination', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/compliance/verification-requests?take=1')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/community-reports', () => {
    it('returns 200 and a list of community reports', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/community-reports')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const report = res.body.find(
        (r: { category: string }) => r.category === 'fraud',
      );
      expect(report).toBeDefined();
      expect(report).toHaveProperty('severity', 'high');
    });

    it('supports pagination', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/community-reports?take=1')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/webhooks/logs', () => {
    it('returns 200 and a list of webhook logs', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/webhooks/logs')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const log = res.body.find(
        (l: { eventType: string }) => l.eventType === 'access.event.created',
      );
      expect(log).toBeDefined();
      expect(log).toHaveProperty('responseStatus', 200);
    });

    it('supports pagination', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/webhooks/logs?take=1')
        .expect(200);

      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/api-keys/platforms/:platformId', () => {
    it('returns 200 and a list of API keys for the platform', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/api-keys/platforms/${platformId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const key = res.body.find((k: { name: string }) => k.name === 'Bootstrap Key');
      expect(key).toBeDefined();
      expect(key).toHaveProperty('scopes');
      expect(Array.isArray(key.scopes)).toBe(true);
    });

    it('returns empty array for unknown platform', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/api-keys/platforms/00000000-0000-0000-0000-000000000000')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
