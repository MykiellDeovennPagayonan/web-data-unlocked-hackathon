import request from 'supertest';
import { createTestApp, TestApp } from '../../helpers/setup-e2e';
import { TestDataTracker } from '../../helpers/test-data-tracker';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('A. Compliance (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;
  let apiKey: string;
  let platformId: string;
  let identityId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();

    const res = await request(testApp.app.getHttpServer())
      .post('/admin/platforms')
      .send({
        name: 'Test Platform Compliance',
        domain: 'compliance.example.com',
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
        emailHash: unique('hash-compliance'),
        encryptedEmail: 'ENC(compliance@example.com)',
        encryptedFullName: 'ENC(Compliance User)',
        trustStatus: 'clean',
      });
    expect(identityRes.status).toBe(201);
    identityId = identityRes.body.id;
    tracker.trackIdentity(identityId);
  });

  afterAll(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('A.1 Audit Logs', () => {
    it('A.1.1 creates an audit log', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/admin/compliance/audit-logs')
        .send({
          actorType: 'system',
          actorId: 'system-001',
          action: 'test_action',
          targetType: 'identity',
          targetId: identityId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.actorType).toBe('system');
      expect(res.body.action).toBe('test_action');
      expect(res.body.targetId).toBe(identityId);
    });

    it('A.1.2 lists audit logs with filters', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/admin/compliance/audit-logs')
        .query({ action: 'test_action', targetId: identityId })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].targetId).toBe(identityId);
    });

    it('A.1.3 audit log is immutable (no update endpoint)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch('/admin/compliance/audit-logs/123')
        .send({ action: 'hacked' });

      expect(res.status).toBe(404);
    });
  });

  describe('A.2 Consent Records', () => {
    let consentId: string;

    it('A.2.1 records consent', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/compliance/consent')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          consentType: 'data_processing',
          consentVersion: 'v1.0',
          ipAtConsent: '192.168.1.1',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.identityId).toBe(identityId);
      expect(res.body.platformId).toBe(platformId);
      expect(res.body.consentType).toBe('data_processing');
      expect(res.body.revokedAt).toBeNull();

      consentId = res.body.id;
      tracker.trackConsentRecord(consentId);
    });

    it('A.2.2 checks active consent', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/compliance/consent/check')
        .set('x-api-key', apiKey)
        .query({ identityId, platformId, consentType: 'data_processing' })
        .expect(200);

      expect(res.body).not.toBeNull();
      expect(res.body.id).toBe(consentId);
    });

    it('A.2.3 revokes consent', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/compliance/consent/${consentId}/revoke`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.id).toBe(consentId);
      expect(res.body.revokedAt).not.toBeNull();
    });

    it('A.2.4 active consent returns null after revocation', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/compliance/consent/check')
        .set('x-api-key', apiKey)
        .query({ identityId, platformId, consentType: 'data_processing' })
        .expect(200);

      expect(res.body).toEqual({});
    });

    it('A.2.5 lists consent by identity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/compliance/consent')
        .set('x-api-key', apiKey)
        .query({ identityId, platformId })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].identityId).toBe(identityId);
    });
  });

  describe('A.3 Verification Requests', () => {
    let requestId: string;

    it('A.3.1 creates a verification request', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/compliance/verification-requests')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          verificationType: 'email',
          provider: 'onfido',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.identityId).toBe(identityId);
      expect(res.body.platformId).toBe(platformId);
      expect(res.body.status).toBe('pending');
      expect(res.body.verificationType).toBe('email');

      requestId = res.body.id;
      tracker.trackVerificationRequest(requestId);
    });

    it('A.3.2 submits a verification request', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/compliance/verification-requests/${requestId}/submit`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.status).toBe('submitted');
      expect(res.body.submittedAt).not.toBeNull();
    });

    it('A.3.3 lists verification requests', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/compliance/verification-requests')
        .set('x-api-key', apiKey)
        .query({ identityId, platformId })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].identityId).toBe(identityId);
    });

    it('A.3.4 gets verification request by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/compliance/verification-requests/${requestId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.id).toBe(requestId);
      expect(res.body.status).toBe('submitted');
    });

    it('A.3.5 admin approves verification request', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/admin/compliance/verification-requests/${requestId}/approve`)
        .expect(201);

      expect(res.body.status).toBe('approved');
      expect(res.body.decidedAt).not.toBeNull();

      // Side-effect: trust signal created
      const signals = await testApp.trustSignalsService.getSignalsByEntity({
        entityType: 'identity',
        identityId,
        signalType: 'kyc_passed',
      });
      expect(signals.length).toBeGreaterThan(0);
      tracker.trackTrustSignal(signals[0].id);
      expect(Number(signals[0].weight)).toBe(15);

      // Side-effect: trust score snapshot created
      const snapshots =
        await testApp.trustScoreSnapshotsService.getSnapshotsByEntity(
          'identity',
          identityId,
        );
      expect(snapshots.length).toBeGreaterThan(0);
      tracker.trackTrustScoreSnapshot(snapshots[0].id);
      expect(Number(snapshots[0].score)).toBe(65);
      expect(snapshots[0].snapshotReason).toBe('certificate_issued');

      // Side-effect: audit log exists
      const logs = await request(testApp.app.getHttpServer())
        .get('/admin/compliance/audit-logs')
        .query({ targetId: requestId })
        .expect(200);
      expect(logs.body.length).toBeGreaterThan(0);
    });

    it('A.3.6 verification request status machine', async () => {
      // Create fresh request for state walk
      const createRes = await request(testApp.app.getHttpServer())
        .post('/v1/compliance/verification-requests')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          verificationType: 'government_id',
          provider: 'jumio',
        })
        .expect(201);

      const freshId = createRes.body.id;
      tracker.trackVerificationRequest(freshId);
      expect(createRes.body.status).toBe('pending');

      // Submit
      const submitRes = await request(testApp.app.getHttpServer())
        .patch(`/v1/compliance/verification-requests/${freshId}/submit`)
        .set('x-api-key', apiKey)
        .expect(200);
      expect(submitRes.body.status).toBe('submitted');

      // Reject
      const rejectRes = await request(testApp.app.getHttpServer())
        .post(`/admin/compliance/verification-requests/${freshId}/reject`)
        .send({ rejectionReason: 'Document unclear' })
        .expect(201);
      expect(rejectRes.body.status).toBe('rejected');
      expect(rejectRes.body.rejectionReason).toBe('Document unclear');

      // Side-effect: no kyc_passed signal from this rejected request
      const signals = await testApp.trustSignalsService.getSignalsByEntity({
        entityType: 'identity',
        identityId,
        signalType: 'kyc_passed',
      });
      // Only the approved one from A.3.5 should exist
      expect(signals.length).toBe(1);
    });
  });
});
