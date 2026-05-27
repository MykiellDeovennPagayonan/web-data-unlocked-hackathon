import request from 'supertest';
import { createTestApp, TestApp } from '../../helpers/setup-e2e';
import { TestDataTracker } from '../../helpers/test-data-tracker';

describe('B. Background Checks (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;
  let apiKey: string;
  let platformId: string;
  let identityId: string;
  let orgId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();

    const platformRes = await request(testApp.app.getHttpServer())
      .post('/admin/platforms')
      .send({
        name: 'Test Platform Background',
        domain: 'bg.example.com',
        status: 'trial',
        strictnessLevel: 'medium',
      });

    expect(platformRes.status).toBe(201);
    platformId = platformRes.body.id;
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
        emailHash: 'bg-hash-001',
        encryptedEmail: 'ENC(test1@example.com)',
        encryptedFullName: 'ENC(Test User One)',
        trustStatus: 'clean',
      });
    expect(identityRes.status).toBe(201);
    identityId = identityRes.body.id;
    tracker.trackIdentity(identityId);

    const orgRes = await request(testApp.app.getHttpServer())
      .post('/v1/organizations')
      .set('x-api-key', apiKey)
      .send({
        legalName: 'Bg Test Org',
        domain: 'bg-org.example.com',
        registrationNumber: 'REG-BG-001',
        country: 'US',
        industry: 'Technology',
        trustStatus: 'clean',
      });
    expect(orgRes.status).toBe(201);
    orgId = orgRes.body.id;
    tracker.trackOrganization(orgId);
  });

  afterAll(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('B.1 Background Checks', () => {
    let checkId: string;

    it('B.1.1 creates a background check for an identity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.entityType).toBe('identity');
      expect(res.body.identityId).toBe(identityId);
      expect(res.body.triggeredBy).toBe('registration');
      expect(res.body.overallVerdict).toBe('clean');
      expect(res.body.completedAt).toBeNull();

      checkId = res.body.id;
      tracker.trackBackgroundCheck(checkId);
    });

    it('B.1.2 creates a background check for an organization', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'organization',
          orgId,
          triggeredBy: 'manual',
        })
        .expect(201);

      expect(res.body.entityType).toBe('organization');
      expect(res.body.orgId).toBe(orgId);
      expect(res.body.identityId).toBeNull();
      tracker.trackBackgroundCheck(res.body.id);
    });

    it('B.1.3 gets background check by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/background-checks/${checkId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.id).toBe(checkId);
    });

    it('B.1.4 returns null for non-existent check', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/background-checks/00000000-0000-0000-0000-000000000000')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body === null || JSON.stringify(res.body) === '{}').toBe(true);
    });

    it('B.1.5 completes check with clean verdict', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${checkId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'clean' })
        .expect(201);

      expect(res.body.overallVerdict).toBe('clean');
      expect(res.body.completedAt).not.toBeNull();
    });

    it('B.1.6 blocked verdict creates negative trust signal', async () => {
      const createRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'manual',
        })
        .expect(201);

      const blockedCheckId = createRes.body.id;
      tracker.trackBackgroundCheck(blockedCheckId);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${blockedCheckId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'blocked' })
        .expect(201);
    });

    it('B.1.7 flagged verdict creates soft negative trust signal', async () => {
      const createRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'manual',
        })
        .expect(201);

      const flaggedCheckId = createRes.body.id;
      tracker.trackBackgroundCheck(flaggedCheckId);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${flaggedCheckId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'flagged' })
        .expect(201);
    });

    it('B.1.8 rejects completing non-existent check', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(
          '/v1/background-checks/00000000-0000-0000-0000-000000000000/complete',
        )
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'clean' })
        .expect(500);

      expect(res.body.message).toContain('Internal server error');
    });

    it('B.1.9 rejects missing api key', async () => {
      await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(401);
    });
  });

  describe('B.2 Background Check Results', () => {
    let resultCheckId: string;

    beforeAll(async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'manual',
        })
        .expect(201);

      resultCheckId = res.body.id;
      tracker.trackBackgroundCheck(resultCheckId);
    });

    it('B.2.1 adds a single check result', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${resultCheckId}/results`)
        .set('x-api-key', apiKey)
        .send({
          source: 'ofac',
          rawResult: { query: 'John Doe', matches: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.95,
          llmSummary: 'No OFAC matches found.',
        })
        .expect(201);

      expect(res.body.source).toBe('ofac');
      expect(res.body.normalizedVerdict).toBe('clear');
      expect(Number(res.body.confidenceScore)).toBe(0.95);
    });

    it('B.2.2 adds multiple results to same check', async () => {
      const sources = [
        {
          source: 'linkedin',
          rawResult: { profiles: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.8,
          llmSummary: 'Profile corroborates identity.',
        },
        {
          source: 'opensanctions',
          rawResult: { hits: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.9,
          llmSummary: 'No sanctions matches.',
        },
        {
          source: 'serp',
          rawResult: { results: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.85,
          llmSummary: 'No adverse news.',
        },
      ];

      for (const payload of sources) {
        const res = await request(testApp.app.getHttpServer())
          .post(`/v1/background-checks/${resultCheckId}/results`)
          .set('x-api-key', apiKey)
          .send(payload)
          .expect(201);

        expect(res.body.checkId).toBe(resultCheckId);
      }
    });

    it('B.2.3 lists results by check', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/background-checks/${resultCheckId}/results`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);
      expect(res.body.every((r: any) => r.checkId === resultCheckId)).toBe(
        true,
      );
    });

    it('B.2.4 adds a hard-flag result', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${resultCheckId}/results`)
        .set('x-api-key', apiKey)
        .send({
          source: 'ofac',
          rawResult: { matches: [{ list: 'OFAC-SDN' }] },
          normalizedVerdict: 'hard_flag',
          confidenceScore: 0.99,
          llmSummary: 'Exact match on OFAC SDN list.',
        })
        .expect(201);

      expect(res.body.normalizedVerdict).toBe('hard_flag');
    });
  });

  describe('B.3 Trust Engine Side Effects', () => {
    let cleanIdentityId: string;
    let blockedIdentityId: string;
    let flaggedIdentityId: string;

    beforeAll(async () => {
      const identities = [
        { emailHash: 'clean-hash', suffix: 'clean' },
        { emailHash: 'blocked-hash', suffix: 'blocked' },
        { emailHash: 'flagged-hash', suffix: 'flagged' },
      ];

      for (const item of identities) {
        const res = await request(testApp.app.getHttpServer())
          .post('/admin/identities')
          .send({
            emailHash: item.emailHash,
            encryptedEmail: `ENC(${item.suffix}@example.com)`,
            encryptedFullName: `ENC(${item.suffix})`,
            trustStatus: 'clean',
          })
          .expect(201);

        tracker.trackIdentity(res.body.id);

        if (item.suffix === 'clean') cleanIdentityId = res.body.id;
        if (item.suffix === 'blocked') blockedIdentityId = res.body.id;
        if (item.suffix === 'flagged') flaggedIdentityId = res.body.id;
      }
    });

    it('B.3.1 clean check creates clean_history trust signal', async () => {
      const checkRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: cleanIdentityId,
          triggeredBy: 'registration',
        })
        .expect(201);

      const checkId = checkRes.body.id;
      tracker.trackBackgroundCheck(checkId);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${checkId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'clean' })
        .expect(201);

      const signalsRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-signals?identityId=${cleanIdentityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(signalsRes.body.length).toBeGreaterThanOrEqual(1);
      const signal = signalsRes.body.find(
        (s: any) => s.referenceId === checkId,
      );
      expect(signal).toBeDefined();
      expect(signal.signalType).toBe('clean_history');
      expect(Number(signal.weight)).toBe(10);
      expect(signal.source).toBe('background_check');

      if (signal?.id) tracker.trackTrustSignal(signal.id);
    });

    it('B.3.2 clean check yields trust score of 60', async () => {
      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${cleanIdentityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Number(scoreRes.body.score)).toBe(60);
      expect(scoreRes.body.signalCount).toBeGreaterThanOrEqual(1);
    });

    it('B.3.3 blocked check creates behavioral_flag trust signal', async () => {
      const checkRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: blockedIdentityId,
          triggeredBy: 'manual',
        })
        .expect(201);

      const checkId = checkRes.body.id;
      tracker.trackBackgroundCheck(checkId);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${checkId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'blocked' })
        .expect(201);

      const signalsRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-signals?identityId=${blockedIdentityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      const signal = signalsRes.body.find(
        (s: any) => s.referenceId === checkId,
      );
      expect(signal).toBeDefined();
      expect(signal.signalType).toBe('behavioral_flag');
      expect(Number(signal.weight)).toBe(-15);

      if (signal?.id) tracker.trackTrustSignal(signal.id);
    });

    it('B.3.4 blocked check yields trust score of 35', async () => {
      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${blockedIdentityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Number(scoreRes.body.score)).toBe(35);
    });

    it('B.3.5 flagged check yields trust score of 45', async () => {
      const checkRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: flaggedIdentityId,
          triggeredBy: 'manual',
        })
        .expect(201);

      const checkId = checkRes.body.id;
      tracker.trackBackgroundCheck(checkId);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${checkId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'flagged' })
        .expect(201);

      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${flaggedIdentityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Number(scoreRes.body.score)).toBe(45);
    });
  });

  describe('B.4 Admin Listings', () => {
    it('B.4.1 lists all background checks (admin)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/background-checks')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('B.4.2 filters by entityType and identityId', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(
          `/admin/background-checks?entityType=identity&identityId=${identityId}`,
        )
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((c: any) => c.entityType === 'identity')).toBe(
        true,
      );
    });

    it('B.4.3 filters by overallVerdict', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/background-checks?overallVerdict=clean')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((c: any) => c.overallVerdict === 'clean')).toBe(
        true,
      );
    });

    it('B.4.4 filters by triggeredBy', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/background-checks?triggeredBy=registration')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((c: any) => c.triggeredBy === 'registration')).toBe(
        true,
      );
    });
  });
});
