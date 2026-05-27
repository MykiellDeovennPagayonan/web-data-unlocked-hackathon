import request from 'supertest';
import { createTestApp, TestApp } from '../../helpers/setup-e2e';
import { TestDataTracker } from '../../helpers/test-data-tracker';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('D. Registry (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;
  let apiKey: string;
  let platformId: string;
  let identityId: string;
  let orgId: string;
  let deviceId: string;
  let ipId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();

    const res = await request(testApp.app.getHttpServer())
      .post('/admin/platforms')
      .send({
        name: 'Test Platform Registry',
        domain: 'registry.example.com',
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
        emailHash: unique('hash-registry'),
        encryptedEmail: 'ENC(registry@example.com)',
        encryptedFullName: 'ENC(Registry User)',
        trustStatus: 'clean',
      });
    expect(identityRes.status).toBe(201);
    identityId = identityRes.body.id;
    tracker.trackIdentity(identityId);

    const orgRes = await request(testApp.app.getHttpServer())
      .post('/v1/organizations')
      .set('x-api-key', apiKey)
      .send({
        legalName: 'Registry Test Org',
        domain: unique('registry-org.example.com'),
        registrationNumber: 'REG-REG-001',
        country: 'US',
        industry: 'Technology',
        trustStatus: 'clean',
        submittedByPlatformId: platformId,
      })
      .expect(201);
    orgId = orgRes.body.id;
    tracker.trackOrganization(orgId);

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

  describe('D.1 Registry Entries', () => {
    let entryId: string;

    it('D.1.1 creates a blacklist entry', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/registry/entries')
        .set('x-api-key', apiKey)
        .send({
          listType: 'blacklist',
          severity: 'yellow_soft',
          sourceType: 'manual',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.listType).toBe('blacklist');
      expect(res.body.severity).toBe('yellow_soft');
      expect(res.body.isActive).toBe(true);

      entryId = res.body.id;
      tracker.trackRegistryEntry(entryId);
    });

    it('D.1.2 gets registry entry by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/registry/entries/${entryId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.id).toBe(entryId);
      expect(res.body.listType).toBe('blacklist');
    });

    it('D.1.3 updates registry entry', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/registry/entries/${entryId}`)
        .set('x-api-key', apiKey)
        .send({ reportCount: 5 })
        .expect(200);

      expect(res.body.id).toBe(entryId);
      expect(res.body.reportCount).toBe(5);
    });

    it('D.1.4 deactivates registry entry', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/registry/entries/${entryId}`)
        .set('x-api-key', apiKey)
        .send({ isActive: false })
        .expect(200);

      expect(res.body.isActive).toBe(false);
    });

    it('D.1.5 escalates severity', async () => {
      // Re-activate first
      await request(testApp.app.getHttpServer())
        .patch(`/v1/registry/entries/${entryId}`)
        .set('x-api-key', apiKey)
        .send({ isActive: true })
        .expect(200);

      const res1 = await request(testApp.app.getHttpServer())
        .post(`/v1/registry/entries/${entryId}/escalate`)
        .set('x-api-key', apiKey)
        .expect(201);

      expect(res1.body.severity).toBe('orange_watch');

      const res2 = await request(testApp.app.getHttpServer())
        .post(`/v1/registry/entries/${entryId}/escalate`)
        .set('x-api-key', apiKey)
        .expect(201);

      expect(res2.body.severity).toBe('red_hard');

      // Ceiling
      const res3 = await request(testApp.app.getHttpServer())
        .post(`/v1/registry/entries/${entryId}/escalate`)
        .set('x-api-key', apiKey)
        .expect(201);

      expect(res3.body.severity).toBe('red_hard');
    });

    it('D.1.6 lists registry entries with filters', async () => {
      // Verify entryId still exists
      const entryCheck = await request(testApp.app.getHttpServer())
        .get(`/v1/registry/entries/${entryId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(entryCheck.body.severity).toBe('red_hard');

      const res = await request(testApp.app.getHttpServer())
        .get('/admin/registry/entries')
        .query({
          listType: 'blacklist',
          severity: 'red_hard',
          isActive: 'true',
        })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].listType).toBe('blacklist');
    });

    it('D.1.7 creates a whitelist entry', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/registry/entries')
        .set('x-api-key', apiKey)
        .send({
          listType: 'whitelist',
          severity: 'yellow_soft',
          sourceType: 'manual',
        })
        .expect(201);

      expect(res.body.listType).toBe('whitelist');
      tracker.trackRegistryEntry(res.body.id);
    });
  });

  describe('D.2 Registry Targets', () => {
    let blacklistEntryId: string;

    beforeAll(async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/registry/entries')
        .set('x-api-key', apiKey)
        .send({
          listType: 'blacklist',
          severity: 'yellow_soft',
          sourceType: 'manual',
        })
        .expect(201);

      blacklistEntryId = res.body.id;
      tracker.trackRegistryEntry(blacklistEntryId);
    });

    it('D.2.1 creates target for identity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/registry/targets')
        .set('x-api-key', apiKey)
        .send({
          registryEntryId: blacklistEntryId,
          targetType: 'identity',
          identityId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.registryEntryId).toBe(blacklistEntryId);
      expect(res.body.targetType).toBe('identity');
      expect(res.body.identityId).toBe(identityId);

      tracker.trackRegistryTarget(res.body.id);
    });

    it('D.2.2 creates multiple targets for one entry (fraud ring)', async () => {
      const ipRes = await request(testApp.app.getHttpServer())
        .post('/v1/registry/targets')
        .set('x-api-key', apiKey)
        .send({
          registryEntryId: blacklistEntryId,
          targetType: 'ip',
          ipId,
        })
        .expect(201);

      tracker.trackRegistryTarget(ipRes.body.id);

      const deviceRes = await request(testApp.app.getHttpServer())
        .post('/v1/registry/targets')
        .set('x-api-key', apiKey)
        .send({
          registryEntryId: blacklistEntryId,
          targetType: 'device',
          deviceId,
        })
        .expect(201);

      tracker.trackRegistryTarget(deviceRes.body.id);
    });

    it('D.2.3 gets targets by entry', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/registry/entries/${blacklistEntryId}/targets`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('D.2.4 lookup entries by entity (identity)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/registry/lookup')
        .query({ targetType: 'identity', identityId })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(
        res.body.some((e: { id: string }) => e.id === blacklistEntryId),
      ).toBe(true);
    });

    it('D.2.5 cross-entity isolation', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/registry/lookup')
        .query({
          targetType: 'identity',
          identityId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('D.2.6 fraud ring lookup', async () => {
      const emailHash = unique('fraud@example.com');

      // Create target with email hash
      const emailTarget = await request(testApp.app.getHttpServer())
        .post('/v1/registry/targets')
        .set('x-api-key', apiKey)
        .send({
          registryEntryId: blacklistEntryId,
          targetType: 'email',
          emailHash,
        })
        .expect(201);

      tracker.trackRegistryTarget(emailTarget.body.id);

      const emailLookup = await request(testApp.app.getHttpServer())
        .get('/admin/registry/lookup')
        .query({ targetType: 'email', emailHash })
        .expect(200);

      expect(emailLookup.body.length).toBeGreaterThan(0);

      const ipLookup = await request(testApp.app.getHttpServer())
        .get('/admin/registry/lookup')
        .query({ targetType: 'ip', ipId })
        .expect(200);

      expect(ipLookup.body.length).toBeGreaterThan(0);
    });
  });

  describe('D.3 Community Reports', () => {
    let reportId: string;
    let reportId2: string;

    it('D.3.1 submits a community report', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/registry/community-reports')
        .set('x-api-key', apiKey)
        .send({
          reportingPlatformId: platformId,
          targetType: 'identity',
          identityId,
          severity: 'high',
          category: 'fraud',
          description: 'Suspicious activity detected',
          evidenceUrls: ['https://example.com/evidence1'],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.reportingPlatformId).toBe(platformId);
      expect(res.body.targetType).toBe('identity');
      expect(res.body.status).toBe('pending');
      expect(res.body.identityId).toBe(identityId);

      reportId = res.body.id;
      tracker.trackCommunityReport(reportId);
    });

    it('D.3.2 gets community report by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/registry/community-reports/${reportId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.id).toBe(reportId);
      expect(res.body.description).toBe('Suspicious activity detected');
    });

    it('D.3.3 lists community reports', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/registry/community-reports')
        .set('x-api-key', apiKey)
        .query({ reportingPlatformId: platformId })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].reportingPlatformId).toBe(platformId);
    });

    it('D.3.4 updates report status to reviewed', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/admin/community-reports/${reportId}/status`)
        .send({ status: 'reviewed' })
        .expect(200);

      expect(res.body.status).toBe('reviewed');
    });

    it('D.3.5 accepts a community report', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/admin/community-reports/${reportId}/accept`)
        .query({ severity: 'orange_watch' })
        .expect(201);

      expect(res.body.status).toBe('accepted');
      expect(res.body).toHaveProperty('registryEntryId');

      const registryEntryId = res.body.registryEntryId;
      tracker.trackRegistryEntry(registryEntryId);

      // Side-effect: registry entry created
      const entry = await request(testApp.app.getHttpServer())
        .get(`/v1/registry/entries/${registryEntryId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(entry.body.listType).toBe('blacklist');
      expect(entry.body.severity).toBe('orange_watch');

      // Side-effect: trust signal created
      const signals = await testApp.trustSignalsService.getSignalsByEntity({
        entityType: 'identity',
        identityId,
        signalType: 'community_report',
      });
      expect(signals.length).toBeGreaterThan(0);
      tracker.trackTrustSignal(signals[0].id);
      expect(Number(signals[0].weight)).toBe(-10);

      // Side-effect: audit log exists
      const logs = await request(testApp.app.getHttpServer())
        .get('/admin/compliance/audit-logs')
        .query({ targetId: reportId })
        .expect(200);
      expect(logs.body.length).toBeGreaterThan(0);
    });

    it('D.3.6 multi-report accumulation', async () => {
      // Second platform reports same identity
      const platform2Res = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Reporter Platform 2',
          domain: 'reporter2.example.com',
          status: 'trial',
          strictnessLevel: 'medium',
        })
        .expect(201);

      const platform2Id = platform2Res.body.id;
      tracker.trackPlatform(platform2Id);

      const keyResult = await testApp.apiKeysService.createApiKey(platform2Id, {
        platformId: platform2Id,
        name: 'Reporter Key',
        scopes: ['read', 'write'],
      });
      const apiKey2 = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      // Submit report from platform 2
      const report2 = await request(testApp.app.getHttpServer())
        .post('/v1/registry/community-reports')
        .set('x-api-key', apiKey2)
        .send({
          reportingPlatformId: platform2Id,
          targetType: 'identity',
          identityId,
          severity: 'medium',
          category: 'fraud',
          description: 'Another suspicious report',
        })
        .expect(201);

      reportId2 = report2.body.id;
      tracker.trackCommunityReport(reportId2);

      // Accept second report (first was already accepted in D.3.5)
      const accept2 = await request(testApp.app.getHttpServer())
        .post(`/admin/community-reports/${reportId2}/accept`)
        .query({ severity: 'orange_watch' })
        .expect(201);

      tracker.trackRegistryEntry(accept2.body.registryEntryId);

      // Assert 2 trust signals => score = 50 + (-10) + (-10) = 30
      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${identityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(scoreRes.body.score).toBe(30);
    });

    it('D.3.7 rejects a community report', async () => {
      const freshIdRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('hash-reject'),
          encryptedEmail: 'ENC(reject@example.com)',
          encryptedFullName: 'ENC(Reject User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const freshId = freshIdRes.body.id;
      tracker.trackIdentity(freshId);

      const report = await request(testApp.app.getHttpServer())
        .post('/v1/registry/community-reports')
        .set('x-api-key', apiKey)
        .send({
          reportingPlatformId: platformId,
          targetType: 'identity',
          identityId: freshId,
          severity: 'low',
          category: 'bot',
          description: 'Looks like spam',
        })
        .expect(201);

      const rejectReportId = report.body.id;
      tracker.trackCommunityReport(rejectReportId);

      await request(testApp.app.getHttpServer())
        .patch(`/admin/community-reports/${rejectReportId}/status`)
        .send({ status: 'rejected' })
        .expect(200);

      // Assert no registry entry linked
      const updatedReport = await request(testApp.app.getHttpServer())
        .get(`/v1/registry/community-reports/${rejectReportId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(updatedReport.body.status).toBe('rejected');
      expect(updatedReport.body.registryEntryId).toBeNull();

      // Assert no trust signal for this identity
      const signals = await testApp.trustSignalsService.getSignalsByEntity({
        entityType: 'identity',
        identityId: freshId,
        signalType: 'community_report',
      });
      expect(signals.length).toBe(0);
    });
  });
});
