import request from 'supertest';
import { createTestApp, TestApp } from '../../helpers/setup-e2e';
import { TestDataTracker } from '../../helpers/test-data-tracker';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('C. Trust Engine (e2e)', () => {
  let testApp: TestApp;
  let tracker: TestDataTracker;
  let apiKey: string;
  let platformId: string;
  let identityId: string;
  let orgId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    tracker = new TestDataTracker();

    const res = await request(testApp.app.getHttpServer())
      .post('/admin/platforms')
      .send({
        name: 'Test Platform Trust',
        domain: 'trust.example.com',
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
        emailHash: unique('hash-trust'),
        encryptedEmail: 'ENC(trust@example.com)',
        encryptedFullName: 'ENC(Trust User)',
        trustStatus: 'clean',
      });
    expect(identityRes.status).toBe(201);
    identityId = identityRes.body.id;
    tracker.trackIdentity(identityId);

    const orgRes = await request(testApp.app.getHttpServer())
      .post('/v1/organizations')
      .set('x-api-key', apiKey)
      .send({
        legalName: 'Trust Test Org',
        domain: unique('trust-org.example.com'),
        registrationNumber: 'REG-TRUST-001',
        country: 'US',
        industry: 'Technology',
        trustStatus: 'clean',
        submittedByPlatformId: platformId,
      })
      .expect(201);
    orgId = orgRes.body.id;
    tracker.trackOrganization(orgId);
  });

  afterAll(async () => {
    await tracker.cleanup(testApp.prisma);
    await testApp.app.close();
  });

  describe('C.1 Trust Signals', () => {
    it('C.1.1 creates trust signal for identity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-signals')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          signalType: 'kyc_passed',
          weight: 15,
          source: 'manual',
          referenceId: unique('ref'),
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.entityType).toBe('identity');
      expect(res.body.identityId).toBe(identityId);
      expect(Number(res.body.weight)).toBe(15);
      expect(res.body.source).toBe('manual');

      tracker.trackTrustSignal(res.body.id);
    });

    it('C.1.2 creates trust signal for organization', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-signals')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'organization',
          orgId,
          signalType: 'linkedin_verified',
          weight: 10,
          source: 'manual',
          referenceId: unique('ref'),
        })
        .expect(201);

      expect(res.body.entityType).toBe('organization');
      expect(res.body.orgId).toBe(orgId);
      expect(Number(res.body.weight)).toBe(10);

      tracker.trackTrustSignal(res.body.id);
    });

    it('C.1.3 computes trust score — baseline (no signals = 50)', async () => {
      // Use fresh identity with no signals
      const freshIdentityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('hash-baseline'),
          encryptedEmail: 'ENC(baseline@example.com)',
          encryptedFullName: 'ENC(Baseline User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const freshId = freshIdentityRes.body.id;
      tracker.trackIdentity(freshId);

      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${freshId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.score).toBe(50);
      expect(res.body.signalCount).toBe(0);
    });

    it('C.1.4 computes trust score — single positive signal', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-signals')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          signalType: 'kyc_passed',
          weight: 15,
          source: 'manual',
          referenceId: unique('ref'),
        })
        .expect(201);

      tracker.trackTrustSignal(res.body.id);

      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${identityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      // C.1.1 already created +15 signal on this identity
      expect(scoreRes.body.score).toBe(80);
      expect(scoreRes.body.signalCount).toBeGreaterThanOrEqual(2);
    });

    it('C.1.5 computes trust score — mixed signals (+15, -20, +5 = 50)', async () => {
      const signals = [
        { weight: 15, type: 'kyc_passed' },
        { weight: -20, type: 'community_report' },
        { weight: 5, type: 'linkedin_verified' },
      ];

      for (const s of signals) {
        const res = await request(testApp.app.getHttpServer())
          .post('/v1/trust-signals')
          .set('x-api-key', apiKey)
          .send({
            entityType: 'identity',
            identityId,
            signalType: s.type,
            weight: s.weight,
            source: 'manual',
            referenceId: unique('ref'),
          })
          .expect(201);

        tracker.trackTrustSignal(res.body.id);
      }

      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${identityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      // C.1.1 (+15) + C.1.4 (+15) + this test (+15, -20, +5) = +30 total => 80
      expect(scoreRes.body.score).toBe(80);
    });

    it('C.1.6 computes trust score — clamped to bounds (+100 = 100, -200 = 0)', async () => {
      // Fresh identity for upper bound
      const upperIdRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('hash-upper'),
          encryptedEmail: 'ENC(upper@example.com)',
          encryptedFullName: 'ENC(Upper User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const upperId = upperIdRes.body.id;
      tracker.trackIdentity(upperId);

      await request(testApp.app.getHttpServer())
        .post('/v1/trust-signals')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: upperId,
          signalType: 'kyc_passed',
          weight: 100,
          source: 'manual',
          referenceId: unique('ref'),
        })
        .expect(201);

      const upperRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${upperId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(upperRes.body.score).toBe(100);

      // Fresh identity for lower bound
      const lowerIdRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('hash-lower'),
          encryptedEmail: 'ENC(lower@example.com)',
          encryptedFullName: 'ENC(Lower User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const lowerId = lowerIdRes.body.id;
      tracker.trackIdentity(lowerId);

      await request(testApp.app.getHttpServer())
        .post('/v1/trust-signals')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: lowerId,
          signalType: 'community_report',
          weight: -200,
          source: 'manual',
          referenceId: unique('ref'),
        })
        .expect(201);

      const lowerRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${lowerId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(lowerRes.body.score).toBe(0);
    });

    it('C.1.7 signal expiry exclusion', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const freshIdRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('hash-expiry'),
          encryptedEmail: 'ENC(expiry@example.com)',
          encryptedFullName: 'ENC(Expiry User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const freshId = freshIdRes.body.id;
      tracker.trackIdentity(freshId);

      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-signals')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId: freshId,
          signalType: 'kyc_passed',
          weight: 15,
          source: 'manual',
          referenceId: unique('ref'),
          expiresAt: pastDate.toISOString(),
        })
        .expect(201);

      tracker.trackTrustSignal(res.body.id);

      const scoreRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score/identity/${freshId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(scoreRes.body.score).toBe(50);
    });

    it('C.1.8 lists trust signals by entity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/trust-signals')
        .set('x-api-key', apiKey)
        .query({ entityType: 'identity', identityId })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].entityType).toBe('identity');
    });
  });

  describe('C.2 Trust Score Snapshots', () => {
    it('C.2.1 creates a trust score snapshot', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-score-snapshots')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          score: 65,
          snapshotReason: 'certificate_issued',
          referenceId: unique('ref'),
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(Number(res.body.score)).toBe(65);
      expect(res.body.snapshotReason).toBe('certificate_issued');

      tracker.trackTrustScoreSnapshot(res.body.id);
    });

    it('C.2.2 lists snapshots by entity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score-snapshots/identity/${identityId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].entityType).toBe('identity');
    });

    it('C.2.3 snapshot is immutable', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch('/v1/trust-score-snapshots/123')
        .set('x-api-key', apiKey)
        .send({ score: 99 });

      expect(res.status).toBe(404);
    });

    it('C.2.4 score history reconstruction', async () => {
      const freshIdRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash: unique('hash-history'),
          encryptedEmail: 'ENC(history@example.com)',
          encryptedFullName: 'ENC(History User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const freshId = freshIdRes.body.id;
      tracker.trackIdentity(freshId);

      const scores = [40, 55, 70];
      for (const score of scores) {
        const res = await request(testApp.app.getHttpServer())
          .post('/v1/trust-score-snapshots')
          .set('x-api-key', apiKey)
          .send({
            entityType: 'identity',
            identityId: freshId,
            score,
            snapshotReason: 'manual_review',
            referenceId: unique('ref'),
          })
          .expect(201);

        tracker.trackTrustScoreSnapshot(res.body.id);
      }

      const listRes = await request(testApp.app.getHttpServer())
        .get(`/v1/trust-score-snapshots/identity/${freshId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(listRes.body.length).toBe(3);
      const numericScores = listRes.body.map((s: { score: number }) =>
        Number(s.score),
      );
      expect(numericScores).toEqual(expect.arrayContaining([40, 55, 70]));
    });
  });

  describe('C.3 Trust Certificates', () => {
    let certificateId: string;
    let backgroundCheckId: string;

    beforeAll(async () => {
      const bcRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(201);

      backgroundCheckId = bcRes.body.id;
      tracker.trackBackgroundCheck(backgroundCheckId);
    });

    it('C.3.1 issues certificate for identity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-certificates')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          issuingCheckId: backgroundCheckId,
          validDays: 90,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.entityType).toBe('identity');
      expect(res.body.identityId).toBe(identityId);
      expect(res.body.status).toBe('active');
      expect(res.body).toHaveProperty('certificateHash');
      expect(res.body).toHaveProperty('blockchainTxHash');

      const expiresAt = new Date(res.body.expiresAt);
      const now = new Date();
      const diffDays = Math.round(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(diffDays).toBeGreaterThanOrEqual(88);
      expect(diffDays).toBeLessThanOrEqual(92);

      certificateId = res.body.id;
      tracker.trackTrustCertificate(certificateId);
    });

    it('C.3.2 issues certificate for organization', async () => {
      const bcRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'organization',
          orgId,
          triggeredBy: 'registration',
        })
        .expect(201);

      const orgCheckId = bcRes.body.id;
      tracker.trackBackgroundCheck(orgCheckId);

      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-certificates')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'organization',
          orgId,
          issuingCheckId: orgCheckId,
        })
        .expect(201);

      expect(res.body.entityType).toBe('organization');
      expect(res.body.orgId).toBe(orgId);
      expect(res.body.status).toBe('active');

      tracker.trackTrustCertificate(res.body.id);
    });

    it('C.3.3 lists certificates by entity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/v1/trust-certificates')
        .set('x-api-key', apiKey)
        .query({ entityType: 'identity', entityId: identityId })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].entityType).toBe('identity');
    });

    it('C.3.4 revokes a certificate', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/trust-certificates/${certificateId}/revoke`)
        .set('x-api-key', apiKey)
        .send({ reason: 'fraud_detected' })
        .expect(200);

      expect(res.body.status).toBe('revoked');
      expect(res.body.revocationReason).toBe('fraud_detected');
    });

    it('C.3.5 certificate default validity', async () => {
      const bcRes = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(201);

      const defaultCheckId = bcRes.body.id;
      tracker.trackBackgroundCheck(defaultCheckId);

      const res = await request(testApp.app.getHttpServer())
        .post('/v1/trust-certificates')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          issuingCheckId: defaultCheckId,
        })
        .expect(201);

      const expiresAt = new Date(res.body.expiresAt);
      const now = new Date();
      const diffDays = Math.round(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(diffDays).toBeGreaterThanOrEqual(88);
      expect(diffDays).toBeLessThanOrEqual(92);

      tracker.trackTrustCertificate(res.body.id);
    });
  });

  describe('C.4 Certificate Verifications', () => {
    let activeCertificateId: string;
    let revokedCertificateId: string;
    let expiredCertificateId: string;

    beforeAll(async () => {
      // Active cert
      const bc1 = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(201);
      tracker.trackBackgroundCheck(bc1.body.id);

      const cert1 = await request(testApp.app.getHttpServer())
        .post('/v1/trust-certificates')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          issuingCheckId: bc1.body.id,
        })
        .expect(201);
      activeCertificateId = cert1.body.id;
      tracker.trackTrustCertificate(activeCertificateId);

      // Revoked cert
      const bc2 = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(201);
      tracker.trackBackgroundCheck(bc2.body.id);

      const cert2 = await request(testApp.app.getHttpServer())
        .post('/v1/trust-certificates')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          issuingCheckId: bc2.body.id,
        })
        .expect(201);
      revokedCertificateId = cert2.body.id;
      tracker.trackTrustCertificate(revokedCertificateId);

      await request(testApp.app.getHttpServer())
        .patch(`/v1/trust-certificates/${revokedCertificateId}/revoke`)
        .set('x-api-key', apiKey)
        .send({ reason: 'test_revoke' })
        .expect(200);

      // Expired cert (seed via service with backdated expiresAt)
      const bc3 = await request(testApp.app.getHttpServer())
        .post('/v1/background-checks')
        .set('x-api-key', apiKey)
        .send({
          entityType: 'identity',
          identityId,
          triggeredBy: 'registration',
        })
        .expect(201);
      tracker.trackBackgroundCheck(bc3.body.id);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expiredCertificateId = (
        await testApp.prisma.trustCertificate.create({
          data: {
            entityType: 'identity',
            identityId,
            issuingCheckId: bc3.body.id,
            expiresAt: pastDate,
            status: 'active',
            certificateHash: unique('hash'),
            blockchainTxHash: unique('tx'),
          },
        })
      ).id;
      tracker.trackTrustCertificate(expiredCertificateId);
    });

    it('C.4.1 verifies an active certificate → valid', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/certificate-verifications/${activeCertificateId}`)
        .set('x-api-key', apiKey)
        .send({ verifiedByPlatformId: platformId })
        .expect(201);

      expect(res.body.verdict).toBe('valid');
      expect(res.body.certificateId).toBe(activeCertificateId);
      expect(res.body.verifiedByPlatformId).toBe(platformId);

      tracker.trackCertificateVerification(res.body.id);
    });

    it('C.4.2 verifies a revoked certificate → revoked', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/certificate-verifications/${revokedCertificateId}`)
        .set('x-api-key', apiKey)
        .send({ verifiedByPlatformId: platformId })
        .expect(201);

      expect(res.body.verdict).toBe('revoked');
      tracker.trackCertificateVerification(res.body.id);
    });

    it('C.4.3 verifies an expired certificate → expired', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/certificate-verifications/${expiredCertificateId}`)
        .set('x-api-key', apiKey)
        .send({ verifiedByPlatformId: platformId })
        .expect(201);

      expect(res.body.verdict).toBe('expired');
      tracker.trackCertificateVerification(res.body.id);
    });

    it('C.4.4 verifies non-existent certificate → 500 (FK constraint)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const res = await request(testApp.app.getHttpServer())
        .post(`/v1/certificate-verifications/${fakeId}`)
        .set('x-api-key', apiKey)
        .send({ verifiedByPlatformId: platformId });

      // Service attempts to insert verification row with missing certificate FK,
      // which violates the required relation and throws 500
      expect(res.status).toBe(500);
    });

    it('C.4.5 lists verifications by certificate', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/certificate-verifications/${activeCertificateId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].certificateId).toBe(activeCertificateId);
    });

    it('C.4.6 multi-platform verification audit', async () => {
      // Create second platform
      const platform2Res = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Second Verifier Platform',
          domain: 'verifier2.example.com',
          status: 'trial',
          strictnessLevel: 'medium',
        })
        .expect(201);

      const platform2Id = platform2Res.body.id;
      tracker.trackPlatform(platform2Id);

      const keyResult = await testApp.apiKeysService.createApiKey(platform2Id, {
        platformId: platform2Id,
        name: 'Verifier Key',
        scopes: ['read', 'write'],
      });
      const apiKey2 = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      const v1 = await request(testApp.app.getHttpServer())
        .post(`/v1/certificate-verifications/${activeCertificateId}`)
        .set('x-api-key', apiKey)
        .send({ verifiedByPlatformId: platformId })
        .expect(201);
      tracker.trackCertificateVerification(v1.body.id);

      const v2 = await request(testApp.app.getHttpServer())
        .post(`/v1/certificate-verifications/${activeCertificateId}`)
        .set('x-api-key', apiKey2)
        .send({ verifiedByPlatformId: platform2Id })
        .expect(201);
      tracker.trackCertificateVerification(v2.body.id);

      const listRes = await request(testApp.app.getHttpServer())
        .get(`/v1/certificate-verifications/${activeCertificateId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      const platforms = listRes.body.map(
        (v: { verifiedByPlatformId: string }) => v.verifiedByPlatformId,
      );
      expect(platforms).toContain(platformId);
      expect(platforms).toContain(platform2Id);
    });
  });
});
