import request from 'supertest';
import { createTestApp, TestApp } from '../../helpers/setup-e2e';
import { TestDataTracker } from '../../helpers/test-data-tracker';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('B. Access & Sessions (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;
  let apiKey: string;
  let platformId: string;
  let identityId: string;
  let deviceId: string;
  let ipId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();

    const res = await request(testApp.app.getHttpServer())
      .post('/admin/platforms')
      .send({
        name: 'Test Platform Access',
        domain: 'access.example.com',
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

    const identityRes = await request(testApp.app.getHttpServer())
      .post('/admin/identities')
      .send({
        emailHash: unique('hash-access'),
        encryptedEmail: 'ENC(access@example.com)',
        encryptedFullName: 'ENC(Access User)',
        trustStatus: 'clean',
      });
    expect(identityRes.status).toBe(201);
    identityId = identityRes.body.id;
    tracker.trackIdentity(identityId);

    const deviceRes = await request(testApp.app.getHttpServer())
      .post('/v1/intelligence/device')
      .set('x-api-key', apiKey)
      .send({
        signals: [
          { signalType: 'canvas_hash', value: unique('canvas') },
          { signalType: 'webgl_hash', value: unique('webgl') },
          { signalType: 'screen_resolution', value: '1920x1080' },
          { signalType: 'os', value: 'macOS' },
          { signalType: 'timezone', value: 'Asia/Manila' },
          { signalType: 'user_agent', value: 'Mozilla/5.0' },
          { signalType: 'browser', value: 'Chrome' },
          { signalType: 'language', value: 'en-US' },
        ],
      })
      .expect(201);
    deviceId = deviceRes.body.device.id;
    tracker.trackDevice(deviceId);

    const ipRes = await request(testApp.app.getHttpServer())
      .post('/v1/intelligence/ip')
      .set('x-api-key', apiKey)
      .send({ ipAddress: '8.8.8.8' })
      .expect(201);
    ipId = ipRes.body.id;
    tracker.trackIpRecord(ipId);
  });

  afterAll(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('B.1 Sessions', () => {
    let sessionId: string;

    it('B.1.1 creates a session', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/access/sessions')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          ipId,
          deviceId,
          sessionTokenHash: unique('token'),
          riskScoreAtStart: 55,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.identityId).toBe(identityId);
      expect(res.body.platformId).toBe(platformId);
      expect(res.body.sessionVerdict).toBe('clean');
      expect(res.body.endedAt).toBeNull();

      sessionId = res.body.id;
      tracker.trackSession(sessionId);
    });

    it('B.1.2 gets session by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/access/sessions/${sessionId}`)
        .expect(200);

      expect(res.body.id).toBe(sessionId);
      expect(res.body.identityId).toBe(identityId);
    });

    it('B.1.3 ends a session', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/access/sessions/${sessionId}/end`)
        .set('x-api-key', apiKey)
        .send({
          riskScoreAtEnd: 60,
          verdict: 'clean',
        })
        .expect(200);

      expect(res.body.id).toBe(sessionId);
      expect(res.body.endedAt).not.toBeNull();
      expect(Number(res.body.riskScoreAtEnd)).toBe(60);
      expect(res.body.sessionVerdict).toBe('clean');
    });

    it('B.1.4 session lifecycle — clean to terminated', async () => {
      const createRes = await request(testApp.app.getHttpServer())
        .post('/v1/access/sessions')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          ipId,
          deviceId,
          sessionTokenHash: unique('token-term'),
          riskScoreAtStart: 70,
        })
        .expect(201);

      const freshSessionId = createRes.body.id;
      tracker.trackSession(freshSessionId);
      expect(createRes.body.sessionVerdict).toBe('clean');

      const endRes = await request(testApp.app.getHttpServer())
        .patch(`/v1/access/sessions/${freshSessionId}/end`)
        .set('x-api-key', apiKey)
        .send({
          riskScoreAtEnd: 95,
          verdict: 'terminated',
          terminationReason: 'manual_admin_action',
        })
        .expect(200);

      expect(endRes.body.sessionVerdict).toBe('terminated');
      expect(endRes.body.terminationReason).toBe('manual_admin_action');
    });
  });

  describe('B.2 Access Events', () => {
    let accessEventId: string;

    it('B.2.1 logs an access event (registration allowed)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/access/events')
        .set('x-api-key', apiKey)
        .send({
          platformId,
          identityId,
          ipId,
          deviceId,
          eventType: 'registration',
          verdict: 'allowed',
          scoreAtEvent: 65,
          triggeredRules: {},
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.platformId).toBe(platformId);
      expect(res.body.identityId).toBe(identityId);
      expect(res.body.eventType).toBe('registration');
      expect(res.body.verdict).toBe('allowed');

      accessEventId = res.body.id;
      tracker.trackAccessEvent(accessEventId);
    });

    it('B.2.2 logs a blocked registration event', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/access/events')
        .set('x-api-key', apiKey)
        .send({
          platformId,
          identityId,
          ipId,
          deviceId,
          eventType: 'registration',
          verdict: 'blocked',
          scoreAtEvent: 10,
          triggeredRules: { trustScoreBelow: 30 },
        })
        .expect(201);

      expect(res.body.verdict).toBe('blocked');
      tracker.trackAccessEvent(res.body.id);
    });

    it('B.2.3 gets platform events', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/access/events/platform/${platformId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body[0].platformId).toBe(platformId);
    });

    it('B.2.4 access event score integrity', async () => {
      const scoreResult = await testApp.trustSignalsService.computeTrustScore(
        'identity',
        identityId,
      );
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/access/events')
        .set('x-api-key', apiKey)
        .send({
          platformId,
          identityId,
          ipId,
          deviceId,
          eventType: 'api_call',
          verdict: 'allowed',
          scoreAtEvent: scoreResult.score,
          triggeredRules: {},
        })
        .expect(201);

      expect(Number(res.body.scoreAtEvent)).toBe(scoreResult.score);
      tracker.trackAccessEvent(res.body.id);
    });
  });

  describe('B.3 Behavioral Events', () => {
    let sessionId: string;

    beforeAll(async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/access/sessions')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          ipId,
          deviceId,
          sessionTokenHash: unique('token-behavioral'),
          riskScoreAtStart: 50,
        })
        .expect(201);

      sessionId = res.body.id;
      tracker.trackSession(sessionId);
    });

    it('B.3.1 logs a behavioral event', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/access/behavioral')
        .set('x-api-key', apiKey)
        .send({
          sessionId,
          identityId,
          platformId,
          eventType: 'api_call',
          endpoint: '/v1/orders',
          flagTriggered: false,
          actionTaken: 'none',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.sessionId).toBe(sessionId);
      expect(res.body.endpoint).toBe('/v1/orders');
      expect(res.body.flagTriggered).toBe(false);

      tracker.trackBehavioralEvent(res.body.id);
    });

    it('B.3.2 logs a behavioral event with flag', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/access/behavioral')
        .set('x-api-key', apiKey)
        .send({
          sessionId,
          identityId,
          platformId,
          eventType: 'endpoint_probe',
          endpoint: '/v1/admin/users',
          flagTriggered: true,
          flagType: 'unauthorized_admin_probe',
          actionTaken: 'throttled',
        })
        .expect(201);

      expect(res.body.flagTriggered).toBe(true);
      expect(res.body.flagType).toBe('unauthorized_admin_probe');
      expect(res.body.actionTaken).toBe('throttled');

      tracker.trackBehavioralEvent(res.body.id);
    });

    it('B.3.3 gets session behavioral events', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/access/behavioral/session/${sessionId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('B.3.4 behavioral exploit detection sequence', async () => {
      // Create fresh session for exploit test
      const sessRes = await request(testApp.app.getHttpServer())
        .post('/v1/access/sessions')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          ipId,
          deviceId,
          sessionTokenHash: unique('token-exploit'),
          riskScoreAtStart: 50,
        })
        .expect(201);

      const exploitSessionId = sessRes.body.id;
      tracker.trackSession(exploitSessionId);

      const events = [
        { eventType: 'endpoint_probe', endpoint: '/v1/admin/config' },
        { eventType: 'scrape_pattern', endpoint: '/v1/products' },
        { eventType: 'rapid_action', endpoint: '/v1/cart' },
      ];

      for (const ev of events) {
        const res = await request(testApp.app.getHttpServer())
          .post('/v1/access/behavioral')
          .set('x-api-key', apiKey)
          .send({
            sessionId: exploitSessionId,
            identityId,
            platformId,
            eventType: ev.eventType,
            endpoint: ev.endpoint,
            flagTriggered: true,
            flagType: 'suspicious_behavior',
            actionTaken: 'session_limited',
          })
          .expect(201);

        tracker.trackBehavioralEvent(res.body.id);
      }

      // Terminate session
      const endRes = await request(testApp.app.getHttpServer())
        .patch(`/v1/access/sessions/${exploitSessionId}/end`)
        .set('x-api-key', apiKey)
        .send({
          riskScoreAtEnd: 85,
          verdict: 'terminated',
          terminationReason: 'behavioral_flags',
        })
        .expect(200);

      expect(endRes.body.sessionVerdict).toBe('terminated');
      expect(endRes.body.terminationReason).toBe('behavioral_flags');

      // Assert all 3 events are flagged
      const sessionEvents = await request(testApp.app.getHttpServer())
        .get(`/admin/access/behavioral/session/${exploitSessionId}`)
        .expect(200);

      expect(sessionEvents.body.length).toBe(3);
      expect(
        sessionEvents.body.every(
          (e: { flagTriggered: boolean }) => e.flagTriggered,
        ),
      ).toBe(true);
    });
  });
});
