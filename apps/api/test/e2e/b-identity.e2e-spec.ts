import request from 'supertest';
import { createTestApp, TestApp } from '../helpers/setup-e2e';
import { TestDataTracker } from '../helpers/test-data-tracker';

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

describe('B. Identity (e2e)', () => {
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
        name: 'Test Platform Beta',
        domain: 'beta.example.com',
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

  describe('B.1 Identities', () => {
    let identityId: string;
    const emailHash = unique('hash');

    it('B.1.1 creates an identity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash,
          encryptedEmail: 'ENC(email@example.com)',
          encryptedFullName: 'ENC(Jane Doe)',
          trustStatus: 'clean',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.emailHash).toBe(emailHash);
      expect(res.body.trustStatus).toBe('clean');
      expect(res.body.isHumanVerified).toBe(false);

      identityId = res.body.id;
      tracker.trackIdentity(identityId);
    });

    it('B.1.2 gets identity by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/identities/${identityId}`)
        .expect(200);

      expect(res.body.id).toBe(identityId);
    });

    it('B.1.3 gets identity by email hash', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/identities/by-email/${emailHash}`)
        .expect(200);

      expect(res.body.emailHash).toBe(emailHash);
    });

    it('B.1.4 updates trust status', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/admin/identities/${identityId}/status`)
        .send({ trustStatus: 'blocked', isHumanVerified: true })
        .expect(200);

      expect(res.body.trustStatus).toBe('blocked');
      expect(res.body.isHumanVerified).toBe(true);
    });
  });

  describe('B.2 Organizations', () => {
    let orgId: string;
    const domain = unique('acme.example.com');

    it('B.2.1 creates an organization (admin)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/admin/organizations')
        .send({
          legalName: 'Acme Corp',
          domain,
          registrationNumber: 'REG-12345',
          country: 'US',
          industry: 'Technology',
          trustStatus: 'clean',
          submittedByPlatformId: platformId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.legalName).toBe('Acme Corp');
      expect(res.body.submittedByPlatformId).toBe(platformId);

      orgId = res.body.id;
      tracker.trackOrganization(orgId);
    });

    it('B.2.2 gets organization by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/organizations/${orgId}`)
        .expect(200);

      expect(res.body.id).toBe(orgId);
    });

    it('B.2.3 gets organization by domain', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/organizations/by-domain/${domain}`)
        .expect(200);

      expect(res.body.domain).toBe(domain);
    });

    it('B.2.4 updates organization trust status', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/admin/organizations/${orgId}/status`)
        .send({ trustStatus: 'verified' })
        .expect(200);

      expect(res.body.trustStatus).toBe('verified');
    });

    it('B.2.5 submits organization (platform-scoped)', async () => {
      const scopedDomain = unique('beta.example.com');
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/organizations')
        .set('x-api-key', apiKey)
        .send({
          legalName: 'Beta Solutions Ltd',
          domain: scopedDomain,
          registrationNumber: 'REG-67890',
          country: 'GB',
          industry: 'Finance',
          trustStatus: 'clean',
        })
        .expect(201);

      expect(res.body.submittedByPlatformId).toBe(platformId);
      tracker.trackOrganization(res.body.id);
    });
  });

  describe('B.3 Platform Users', () => {
    let identityId: string;
    let platformUserId: string;
    const externalUserId = unique('user');
    const emailHash = unique('pu-hash');

    beforeAll(async () => {
      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash,
          encryptedEmail: 'ENC(test@example.com)',
          encryptedFullName: 'ENC(Test User)',
          trustStatus: 'clean',
        })
        .expect(201);

      identityId = identityRes.body.id;
      tracker.trackIdentity(identityId);
    });

    it('B.3.1 creates a platform user', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/v1/platform-users')
        .set('x-api-key', apiKey)
        .send({
          identityId,
          platformId,
          externalUserId,
          statusOnPlatform: 'active',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.identityId).toBe(identityId);
      expect(res.body.platformId).toBe(platformId);
      expect(res.body.externalUserId).toBe(externalUserId);

      platformUserId = res.body.id;
      tracker.trackPlatformUser(platformUserId);
    });

    it('B.3.2 gets platform user by external id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/v1/platform-users/${externalUserId}`)
        .set('x-api-key', apiKey)
        .expect(200);

      expect(res.body.externalUserId).toBe(externalUserId);
    });

    it('B.3.3 updates platform user status', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/v1/platform-users/${externalUserId}/status`)
        .set('x-api-key', apiKey)
        .send({ statusOnPlatform: 'blocked' })
        .expect(200);

      expect(res.body.statusOnPlatform).toBe('blocked');
    });

    it('B.3.4 cross-tenancy isolation', async () => {
      // Create a second platform with its own key
      const platformBRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Platform B',
          domain: unique('platform-b.example.com'),
          status: 'trial',
          strictnessLevel: 'low',
        })
        .expect(201);

      const platformBId = platformBRes.body.id;
      tracker.trackPlatform(platformBId);

      const keyBResult = await testApp.apiKeysService.createApiKey(
        platformBId,
        {
          platformId: platformBId,
          name: 'Key B',
          scopes: ['read'],
        },
      );
      tracker.trackApiKey(keyBResult.apiKey.id);

      // Using Platform B's key to look up Platform A's user should 404
      await request(testApp.app.getHttpServer())
        .get(`/v1/platform-users/${externalUserId}`)
        .set('x-api-key', keyBResult.rawKey)
        .expect(404);
    });
  });

  describe('B.4 Entity Aliases', () => {
    let identityId: string;
    let aliasId: string;
    const emailHash = unique('alias-hash');
    const aliasValueHash = unique('alias-value-hash');

    beforeAll(async () => {
      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          emailHash,
          encryptedEmail: 'ENC(alias@example.com)',
          encryptedFullName: 'ENC(Alias User)',
          trustStatus: 'clean',
        })
        .expect(201);

      identityId = identityRes.body.id;
      tracker.trackIdentity(identityId);
    });

    it('B.4.1 creates an alias', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/admin/aliases')
        .send({
          canonicalEntityType: 'identity',
          canonicalEntityId: identityId,
          aliasType: 'email',
          aliasValueHash,
          aliasValueEncrypted: 'ENC(alias_value)',
          confidence: 0.95,
          source: 'manual',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.canonicalEntityId).toBe(identityId);
      expect(res.body.aliasType).toBe('email');

      aliasId = res.body.id;
      tracker.trackEntityAlias(aliasId);
    });

    it('B.4.2 lists aliases by entity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/admin/aliases/entity/identity/${identityId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(
        res.body.every((a: any) => a.canonicalEntityId === identityId),
      ).toBe(true);
    });

    it('B.4.3 resolves canonical entity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/admin/aliases/resolve')
        .send({
          aliasType: 'email',
          aliasValueHash,
        })
        .expect(200);

      expect(res.body.canonicalEntityId).toBe(identityId);
    });

    it('B.4.4 updates alias confidence', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/admin/aliases/${aliasId}/confidence`)
        .send({ confidence: 0.72 })
        .expect(200);

      expect(res.body.confidence).toBe(0.72);
    });
  });
});
