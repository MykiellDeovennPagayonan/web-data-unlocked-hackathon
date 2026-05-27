import request from 'supertest';
import { createTestApp, TestApp } from '../../helpers/setup-e2e';
import { TestDataTracker } from '../../helpers/test-data-tracker';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('C. Integration Scenarios (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;

  beforeEach(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();
  });

  afterEach(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('C.1 Registration-Time Trust Evaluation', () => {
    it('chains platform, identity, device, ip, user, bg check, and trust score', async () => {
      // Step 1: Create platform
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'E-Shop Gamma',
          domain: unique('eshop-gamma.example.com'),
          status: 'trial',
          strictnessLevel: 'high',
        })
        .expect(201);

      const adminPlatformId = platformRes.body.id;
      tracker.trackPlatform(adminPlatformId);

      // Step 2: Bootstrap API key
      const keyResult = await testApp.apiKeysService.createApiKey(
        adminPlatformId,
        {
          platformId: adminPlatformId,
          name: 'E-Shop Gamma Master Key',
          scopes: ['read', 'write'],
        },
      );
      const adminApiKeyRaw = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      // Step 3: Create identity
      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('hash'),
          encryptedEmail: 'ENC(email@eshop-gamma.example.com)',
          encryptedFullName: 'ENC(Jane Doe)',
          trustStatus: 'clean',
        })
        .expect(201);

      const identityId = identityRes.body.id;
      tracker.trackIdentity(identityId);

      // Step 4: Resolve device
      const deviceRes = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', adminApiKeyRaw)
        .send({
          signals: [
            { signalType: 'canvas_hash', value: 'canvas1' },
            { signalType: 'webgl_hash', value: 'webgl1' },
            { signalType: 'screen_resolution', value: '1920x1080' },
            { signalType: 'os', value: 'macOS' },
            { signalType: 'timezone', value: 'Asia/Manila' },
            { signalType: 'user_agent', value: 'Mozilla/5.0' },
            { signalType: 'browser', value: 'Chrome' },
            { signalType: 'language', value: 'en-US' },
          ],
        })
        .expect(201);

      const deviceId = deviceRes.body.device.id;
      expect(deviceRes.body.isNew).toBe(true);
      tracker.trackDevice(deviceId);

      // Step 5: Evaluate IP
      const ipRes = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/ip')
        .set('x-api-key', adminApiKeyRaw)
        .send({ ipAddress: '8.8.8.8' })
        .expect(201);

      const ipId = ipRes.body.id;
      tracker.trackIpRecord(ipId);
      expect(ipRes.body).toHaveProperty('ipType');
      expect(ipRes.body).toHaveProperty('riskScore');

      // Step 6: Create platform user
      const userRes = await request(testApp.app.getHttpServer())
        .post('/v1/platform-users')
        .set('x-api-key', adminApiKeyRaw)
        .send({
          identityId,
          platformId: adminPlatformId,
          externalUserId: 'reg_user_001',
          statusOnPlatform: 'active',
        })
        .expect(201);

      expect(userRes.body.platformId).toBe(adminPlatformId);
      expect(userRes.body.identityId).toBe(identityId);
      tracker.trackPlatformUser(userRes.body.id);

      // Step 7: Trigger background check
      const checkRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', adminApiKeyRaw)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(201);

      const checkId = checkRes.body.id;
      tracker.trackBackgroundCheck(checkId);
      expect(checkRes.body.overallVerdict).toBe('clean');

      // Step 8: Add mock results
      const results = [
        {
          source: 'ofac',
          rawResult: { matches: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.95,
          llmSummary: 'No OFAC matches.',
        },
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

      for (const payload of results) {
        await request(testApp.app.getHttpServer())
          .post(`/v1/background-checks/${checkId}/results`)
          .set('x-api-key', adminApiKeyRaw)
          .send(payload)
          .expect(201);
      }

      // Step 9: Complete as clean
      const completeRes = await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${checkId}/complete`)
        .set('x-api-key', adminApiKeyRaw)
        .send({ overallVerdict: 'clean' })
        .expect(201);

      expect(completeRes.body.overallVerdict).toBe('clean');
      expect(completeRes.body.completedAt).not.toBeNull();

      // Step 10: Verify trust score
      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${identityId}`)
        .set('x-api-key', adminApiKeyRaw)
        .expect(200);

      expect(Number(scoreRes.body.score)).toBe(60);
      expect(scoreRes.body.signalCount).toBeGreaterThanOrEqual(1);

      // Step 11: Verify trust signal details
      const signalsRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-signals?identityId=${identityId}`)
        .set('x-api-key', adminApiKeyRaw)
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
  });

  describe('C.2 Suspicious Device + IP → Flagged', () => {
    it('flags a user from high-risk device and IP', async () => {
      // Setup platform
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Suspicious Platform',
          domain: unique('sus.example.com'),
          status: 'trial',
          strictnessLevel: 'high',
        })
        .expect(201);

      const platformId = platformRes.body.id;
      tracker.trackPlatform(platformId);

      const keyResult = await testApp.apiKeysService.createApiKey(platformId, {
        platformId,
        name: 'Key',
        scopes: ['read', 'write'],
      });
      const apiKey = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      // Create identity
      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('sus-hash'),
          encryptedEmail: 'ENC(sus@example.com)',
          encryptedFullName: 'ENC(Suspicious User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const susIdentityId = identityRes.body.id;
      tracker.trackIdentity(susIdentityId);

      // Resolve device
      const deviceRes = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', apiKey)
        .send({
          signals: [
            { signalType: 'canvas_hash', value: 'sus_canvas' },
            { signalType: 'webgl_hash', value: 'sus_webgl' },
            { signalType: 'screen_resolution', value: '1920x1080' },
            { signalType: 'os', value: 'Windows' },
            { signalType: 'timezone', value: 'UTC' },
          ],
        })
        .expect(201);

      const susDeviceId = deviceRes.body.device.id;
      tracker.trackDevice(susDeviceId);

      // Set device risk high via service
      const updatedDevice = await testApp.devicesService.updateDeviceRiskScore(
        susDeviceId,
        85,
      );
      expect(Number(updatedDevice.riskScore)).toBe(85);

      // Evaluate suspicious IP
      const ipRes = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/ip')
        .set('x-api-key', apiKey)
        .send({ ipAddress: '10.0.0.1' })
        .expect(201);

      tracker.trackIpRecord(ipRes.body.id);

      // Background check + flagged
      const checkRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: susIdentityId,
          triggeredBy: 'registration',
        })
        .expect(201);

      const susCheckId = checkRes.body.id;
      tracker.trackBackgroundCheck(susCheckId);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${susCheckId}/results`)
        .set('x-api-key', apiKey)
        .send({
          source: 'serp',
          rawResult: { results: [] },
          normalizedVerdict: 'soft_flag',
          confidenceScore: 0.7,
          llmSummary: 'Adverse mention in search.',
        })
        .expect(201);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${susCheckId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'flagged' })
        .expect(201);

      // Verify low trust score
      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${susIdentityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Number(scoreRes.body.score)).toBe(45);
    });
  });

  describe('C.3 Organization Verification Pipeline', () => {
    it('submits org, runs bg check, and verifies trust score', async () => {
      // Setup
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Org Verify Platform',
          domain: unique('org-verify.example.com'),
          status: 'trial',
          strictnessLevel: 'medium',
        })
        .expect(201);

      const platformId = platformRes.body.id;
      tracker.trackPlatform(platformId);

      const keyResult = await testApp.apiKeysService.createApiKey(platformId, {
        platformId,
        name: 'Key',
        scopes: ['read', 'write'],
      });
      const apiKey = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      // Submit organization
      const orgRes = await request(testApp.app.getHttpServer())
        .post('/v1/organizations')
        .set('x-api-key', apiKey)
        .send({
          legalName: 'Partner Logistics',
          domain: 'partner-logistics.example.com',
          registrationNumber: 'REG-PL-2025',
          country: 'PH',
          industry: 'Logistics',
          trustStatus: 'clean',
        })
        .expect(201);

      const orgId = orgRes.body.id;
      tracker.trackOrganization(orgId);
      expect(orgRes.body.submittedByPlatformId).toBe(platformId);

      // Create org background check
      const checkRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'organization',
          orgId,
          triggeredBy: 'manual',
        })
        .expect(201);

      const orgCheckId = checkRes.body.id;
      tracker.trackBackgroundCheck(orgCheckId);

      // Add verification results
      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${orgCheckId}/results`)
        .set('x-api-key', apiKey)
        .send({
          source: 'business_registry',
          rawResult: { found: true },
          normalizedVerdict: 'clear',
          confidenceScore: 0.95,
          llmSummary: 'Verified in business registry.',
        })
        .expect(201);

      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${orgCheckId}/results`)
        .set('x-api-key', apiKey)
        .send({
          source: 'ofac',
          rawResult: { matches: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.99,
          llmSummary: 'No sanctions matches.',
        })
        .expect(201);

      // Complete as clean
      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${orgCheckId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'clean' })
        .expect(201);

      // Verify org trust score
      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/organization/${orgId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Number(scoreRes.body.score)).toBe(60);

      // Lookup by domain
      const lookupRes = await request(testApp.app.getHttpServer())
        .get('/admin/organizations/by-domain/partner-logistics.example.com')
        .expect(200);

      expect(lookupRes.body.id).toBe(orgId);
      expect(lookupRes.body.trustStatus).toBe('clean');
    });
  });

  describe('C.4 Device Fingerprint Re-recognition', () => {
    it('recognizes returning device despite non-stable signal drift', async () => {
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Device Recon Platform',
          domain: unique('device-recon.example.com'),
          status: 'trial',
          strictnessLevel: 'medium',
        })
        .expect(201);

      const platformId = platformRes.body.id;
      tracker.trackPlatform(platformId);

      const keyResult = await testApp.apiKeysService.createApiKey(platformId, {
        platformId,
        name: 'Key',
        scopes: ['read', 'write'],
      });
      const apiKey = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      // First session
      const stableSignals = [
        { signalType: 'canvas_hash', value: 'canvas_stable' },
        { signalType: 'webgl_hash', value: 'webgl_stable' },
        { signalType: 'screen_resolution', value: '2560x1440' },
        { signalType: 'os', value: 'macOS' },
        { signalType: 'timezone', value: 'Asia/Manila' },
      ];

      const firstRes = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', apiKey)
        .send({
          signals: [
            ...stableSignals,
            { signalType: 'user_agent', value: 'Mozilla/5.0 v1' },
            { signalType: 'browser', value: 'Chrome' },
            { signalType: 'language', value: 'en-US' },
          ],
        })
        .expect(201);

      const deviceId = firstRes.body.device.id;
      const stableHash = firstRes.body.device.stableHash;
      expect(firstRes.body.isNew).toBe(true);
      tracker.trackDevice(deviceId);

      // Second session: only non-stable signals changed
      const secondRes = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', apiKey)
        .send({
          signals: [
            ...stableSignals,
            { signalType: 'user_agent', value: 'Mozilla/5.0 v2' },
            { signalType: 'browser', value: 'Chrome' },
            { signalType: 'language', value: 'en-GB' },
          ],
        })
        .expect(201);

      expect(secondRes.body.isNew).toBe(false);
      expect(secondRes.body.device.id).toBe(deviceId);
      expect(secondRes.body.device.stableHash).toBe(stableHash);

      // Third session: stable signals changed
      const thirdRes = await request(testApp.app.getHttpServer())
        .post('/v1/intelligence/device')
        .set('x-api-key', apiKey)
        .send({
          signals: [
            { signalType: 'canvas_hash', value: 'canvas_changed' },
            { signalType: 'webgl_hash', value: 'webgl_changed' },
            { signalType: 'screen_resolution', value: '1920x1080' },
            { signalType: 'os', value: 'Windows' },
            { signalType: 'timezone', value: 'America/New_York' },
            { signalType: 'user_agent', value: 'Mozilla/5.0' },
            { signalType: 'browser', value: 'Firefox' },
            { signalType: 'language', value: 'en-US' },
          ],
        })
        .expect(201);

      expect(thirdRes.body.isNew).toBe(true);
      expect(thirdRes.body.device.id).not.toBe(deviceId);
      expect(thirdRes.body.device.stableHash).not.toBe(stableHash);
      tracker.trackDevice(thirdRes.body.device.id);
    });
  });

  describe('C.5 Mock Orchestrator Aggregation', () => {
    it('aggregates hard_flag to blocked verdict and lowers score', async () => {
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Orchestrator Platform',
          domain: unique('orch.example.com'),
          status: 'trial',
          strictnessLevel: 'medium',
        })
        .expect(201);

      const platformId = platformRes.body.id;
      tracker.trackPlatform(platformId);

      const keyResult = await testApp.apiKeysService.createApiKey(platformId, {
        platformId,
        name: 'Key',
        scopes: ['read', 'write'],
      });
      const apiKey = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('orch-hash'),
          encryptedEmail: 'ENC(orch@example.com)',
          encryptedFullName: 'ENC(Orchestrator Test)',
          trustStatus: 'clean',
        })
        .expect(201);

      const orchIdentityId = identityRes.body.id;
      tracker.trackIdentity(orchIdentityId);

      // Create check
      const checkRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: orchIdentityId,
          triggeredBy: 'manual',
        })
        .expect(201);

      const checkId = checkRes.body.id;
      tracker.trackBackgroundCheck(checkId);

      // Add mixed results: one hard flag, rest clear
      const results = [
        {
          source: 'ofac',
          rawResult: { matches: [{ list: 'OFAC-SDN' }] },
          normalizedVerdict: 'hard_flag',
          confidenceScore: 0.99,
          llmSummary: 'Exact match on OFAC SDN.',
        },
        {
          source: 'linkedin',
          rawResult: { profiles: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.8,
          llmSummary: 'Profile corroborates.',
        },
        {
          source: 'opensanctions',
          rawResult: { hits: [] },
          normalizedVerdict: 'clear',
          confidenceScore: 0.9,
          llmSummary: 'No sanctions.',
        },
      ];

      for (const payload of results) {
        await request(testApp.app.getHttpServer())
          .post(`/v1/background-checks/${checkId}/results`)
          .set('x-api-key', apiKey)
          .send(payload)
          .expect(201);
      }

      // Complete as blocked (aggregation rule: any hard_flag -> blocked)
      await request(testApp.app.getHttpServer())
        .post(`/v1/background-checks/${checkId}/complete`)
        .set('x-api-key', apiKey)
        .send({ overallVerdict: 'blocked' })
        .expect(201);

      // Verify trust score dropped
      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${orchIdentityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Number(scoreRes.body.score)).toBe(35);
    });
  });

  describe('C.6 Access Event Simulation', () => {
    it.skip('evaluates real-time access event (skipped: access-events module not yet implemented)', async () => {
      // This test documents the intended flow for when access-events is built:
      // 1. Platform receives event with IP + device signals
      // 2. TrustLayer resolves IP and device
      // 3. Computes trust score for identity
      // 4. Evaluates platform rules
      // 5. Returns verdict: allowed / flagged / throttled / blocked
      // 6. Logs event to access_events table
    });
  });
});
