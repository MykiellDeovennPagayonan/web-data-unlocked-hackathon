import request from 'supertest';
import { createTestApp, TestApp } from '../helpers/setup-e2e';
import { TestDataTracker } from '../helpers/test-data-tracker';

describe('A. Platform Management (e2e)', () => {
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
        name: 'Test Platform Alpha',
        domain: 'alpha.example.com',
        status: 'trial',
        strictnessLevel: 'medium',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    platformId = res.body.id;
    tracker.trackPlatform(platformId);

    const keyResult = await testApp.apiKeysService.createApiKey(platformId, {
      name: 'Bootstrap Key',
      platformId,
      scopes: ['read', 'write'],
    });
    apiKey = keyResult.rawKey;
    tracker.trackApiKey(keyResult.apiKey.id);
  });

  afterAll(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('A.1 Platforms', () => {
    it('A.1.1 creates a platform', () => {
      expect(platformId).toBeDefined();
      expect(typeof platformId).toBe('string');
    });

    it('A.1.2 lists platforms', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/platforms')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('A.1.3 gets platform by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/platforms/${platformId}`)
        .expect(200);

      expect(res.body.id).toBe(platformId);
    });

    it('A.1.4 updates platform status', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/admin/platforms/${platformId}/status`)
        .send({ status: 'active' })
        .expect(200);

      expect(res.body.status).toBe('active');
    });

    it('A.1.5 self-service get current platform', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/platform')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.id).toBe(platformId);
    });

    it('A.1.6 self-service update current platform', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch('/v1/platform')
        .set('x-api-key', apiKey)
        .send({ name: 'Updated Platform Name', domain: 'updated.example.com' })
        .expect(200);

      expect(res.body.name).toBe('Updated Platform Name');
      expect(res.body.domain).toBe('updated.example.com');
      expect(res.body.id).toBe(platformId);
    });

    it('A.1.7 updates strictness level', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch('/v1/platform/strictness')
        .set('x-api-key', apiKey)
        .send({ strictnessLevel: 'high' })
        .expect(200);

      expect(res.body.strictnessLevel).toBe('high');
    });

    it('A.1.8 auth missing api key returns 401', async () => {
      await request(testApp.app.getHttpServer())
        .get('/v1/platform')
        .expect(401);
    });

    it('A.1.8 auth invalid api key returns 401', async () => {
      await request(testApp.app.getHttpServer())
        .get('/v1/platform')
        .set('x-api-key', 'invalid-key-123')
        .expect(401);
    });
  });

  describe('A.2 API Keys', () => {
    let newKeyId: string;
    let newApiKey: string;

    it('A.2.1 lists api keys', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/platform/api-keys')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('scopes');
      expect(res.body[0]).toHaveProperty('createdAt');
      expect(res.body[0]).not.toHaveProperty('keyHash');
    });

    it('A.2.2 creates api key', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/platform/api-keys')
        .set('x-api-key', apiKey)
        .send({
          name: 'Production Key',
          scopes: ['read', 'write'],
          expiresAt: '2026-12-31T23:59:59Z',
        })
        .expect(201);

      expect(res.body).toHaveProperty('apiKey');
      expect(res.body).toHaveProperty('rawKey');
      expect(res.body.apiKey).toHaveProperty('id');
      expect(res.body.apiKey.name).toBe('Production Key');
      expect(res.body.apiKey.scopes).toEqual(['read', 'write']);
      expect(res.body.rawKey).toMatch(/^tl_/);

      newKeyId = res.body.apiKey.id;
      newApiKey = res.body.rawKey;
      tracker.trackApiKey(newKeyId);
    });

    it('A.2.3 revokes api key', async () => {
      const res = await request(testApp.app.getHttpServer())
        .delete(`/v1/platform/api-keys/${newKeyId}`)
        .expect(200);

      expect(res.body.revokedAt).not.toBeNull();

      // Subsequent request with revoked key returns 401
      await request(testApp.app.getHttpServer())
        .get('/v1/platform/api-keys')
        .set('x-api-key', newApiKey)
        .expect(401);
    });

    it('A.2.4 rotates api key', async () => {
      // Create a fresh key to rotate
      const createRes = await request(testApp.app.getHttpServer())
        .post('/v1/platform/api-keys')
        .set('x-api-key', apiKey)
        .send({ name: 'Rotatable Key', scopes: ['read'] })
        .expect(201);

      const rotatableKeyId = createRes.body.apiKey.id;
      const rotatableRawKey = createRes.body.rawKey;
      tracker.trackApiKey(rotatableKeyId);

      const rotateRes = await request(testApp.app.getHttpServer())
        .post(`/v1/platform/api-keys/${rotatableKeyId}/rotate`)
        .set('x-api-key', apiKey)
        .send({ name: 'Rotated Key' })
        .expect(201);

      expect(rotateRes.body.rawKey).not.toBe(rotatableRawKey);
      expect(rotateRes.body.apiKey).toHaveProperty('id');
      expect(rotateRes.body.apiKey.id).not.toBe(rotatableKeyId);
      tracker.trackApiKey(rotateRes.body.apiKey.id);
    });
  });

  describe('A.3 Platform Rules', () => {
    let ruleId: string;

    it('A.3.2 creates a rule', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/platform/rules')
        .set('x-api-key', apiKey)
        .send({
          ruleTrigger: 'registration',
          conditionJson: { ipRiskScoreAbove: 70 },
          action: 'block',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.platformId).toBe(platformId);
      expect(res.body.ruleTrigger).toBe('registration');
      expect(res.body.action).toBe('block');
      expect(res.body.isActive).toBe(true);

      ruleId = res.body.id;
      tracker.trackPlatformRule(ruleId);
    });

    it('A.3.1 lists rules', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/platform/rules')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((r: any) => r.id === ruleId)).toBe(true);
    });

    it('A.3.3 updates a rule', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/platform/rules/${ruleId}`)
        .send({ action: 'throttle', conditionJson: { ipRiskScoreAbove: 50 } })
        .expect(200);

      expect(res.body.action).toBe('throttle');
    });

    it('A.3.5 toggles a rule', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/platform/rules/${ruleId}/toggle`)
        .send({ isActive: false })
        .expect(201);

      expect(res.body.isActive).toBe(false);
    });

    it('A.3.4 deletes a rule', async () => {
      // Create a throw-away rule to delete
      const createRes = await request(testApp.app.getHttpServer())
        .post('/v1/platform/rules')
        .set('x-api-key', apiKey)
        .send({
          ruleTrigger: 'login',
          conditionJson: {},
          action: 'flag',
        })
        .expect(201);

      const deleteRuleId = createRes.body.id;
      tracker.trackPlatformRule(deleteRuleId);

      await request(testApp.app.getHttpServer())
        .delete(`/v1/platform/rules/${deleteRuleId}`)
        .expect(200);

      const listRes = await request(testApp.app.getHttpServer())
        .get('/v1/platform/rules')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(listRes.body.some((r: any) => r.id === deleteRuleId)).toBe(false);
    });

    it('A.3.6 applies preset rules', async () => {
      await request(testApp.app.getHttpServer())
        .post('/v1/platform/rules/apply-preset')
        .set('x-api-key', apiKey)
        .send({ strictnessLevel: 'high' })
        .expect(201);
    });
  });

  describe('A.4 Webhooks', () => {
    let webhookLogId: string;

    beforeAll(async () => {
      // Seed a webhook log directly via Prisma since there is no public create endpoint
      const log = await testApp.prisma.webhookDeliveryLog.create({
        data: {
          platformId,
          eventType: 'test.event',
          payload: {},
          responseStatus: 200,
          attemptNumber: 1,
        },
      });
      webhookLogId = log.id;
      tracker.trackWebhookLog(webhookLogId);
    });

    it('A.4.1 lists webhook logs', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/platform/webhooks/logs')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('A.4.2 gets webhook log by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/platform/webhooks/logs/${webhookLogId}`)
        .expect(200);

      expect(res.body.id).toBe(webhookLogId);
      expect(res.body).toHaveProperty('eventType');
      expect(res.body).toHaveProperty('payload');
    });

    it('A.4.3 retries webhook', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/platform/webhooks/logs/${webhookLogId}/retry`)
        .send({})
        .expect(201);

      expect(res.body).toHaveProperty('id');
      tracker.trackWebhookLog(res.body.id);
    });
  });
});
