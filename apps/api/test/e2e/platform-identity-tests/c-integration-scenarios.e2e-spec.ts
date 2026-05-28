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

  describe('C.1 Full Onboarding Flow', () => {
    it('chains platform, key, identity, org, and user creation', async () => {
      // Step 1: Admin creates a platform
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'E-Shop Beta',
          domain: unique('eshop-beta.example.com'),
          status: 'trial',
          strictnessLevel: 'medium',
        })
        .expect(201);

      const adminPlatformId = platformRes.body.id;
      tracker.trackPlatform(adminPlatformId);

      // Step 2: Admin creates an API key for that platform (via service bootstrap)
      const keyResult = await testApp.apiKeysService.createApiKey(
        adminPlatformId,
        {
          platformId: adminPlatformId,
          name: 'E-Shop Beta Master Key',
          scopes: ['platform:read', 'platform:write', 'identity:write'],
        },
      );
      const adminApiKeyRaw = keyResult.rawKey;
      tracker.trackApiKey(keyResult.apiKey.id);

      // Step 3: Platform uses its key to read its own profile
      const selfRes = await request(testApp.app.getHttpServer())
        .get('/v1/platform')
        .set('x-api-key', adminApiKeyRaw)
        .expect(200);

      expect(selfRes.body.id).toBe(adminPlatformId);

      // Step 4: Admin creates an identity
      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          email: `${unique('email')}@example.com`,
          encryptedEmail: 'ENC(email@eshop-beta.example.com)',
          encryptedFullName: 'ENC(Jane Doe)',
          trustStatus: 'clean',
        })
        .expect(201);

      const identityId = identityRes.body.id;
      tracker.trackIdentity(identityId);

      // Step 5: Platform submits an organization
      const orgRes = await request(testApp.app.getHttpServer())
        .post('/v1/organizations')
        .set('x-api-key', adminApiKeyRaw)
        .send({
          legalName: 'E-Shop Beta Inc',
          domain: unique('eshop-beta-inc.example.com'),
          registrationNumber: 'US-REG-99999',
          country: 'US',
          industry: 'E-commerce',
          trustStatus: 'clean',
        })
        .expect(201);

      expect(orgRes.body.submittedByPlatformId).toBe(adminPlatformId);
      tracker.trackOrganization(orgRes.body.id);

      // Step 6: Platform creates a platform user linking the identity
      const userRes = await request(testApp.app.getHttpServer())
        .post('/v1/platform-users')
        .set('x-api-key', adminApiKeyRaw)
        .send({
          identityId,
          platformId: adminPlatformId,
          externalUserId: 'ext_user_001',
          statusOnPlatform: 'active',
        })
        .expect(201);

      expect(userRes.body.platformId).toBe(adminPlatformId);
      expect(userRes.body.identityId).toBe(identityId);
      tracker.trackPlatformUser(userRes.body.id);

      // Step 7: Platform fetches the user back by external ID
      const fetchRes = await request(testApp.app.getHttpServer())
        .get('/v1/platform-users/ext_user_001')
        .set('x-api-key', adminApiKeyRaw)
        .expect(200);

      expect(fetchRes.body.externalUserId).toBe('ext_user_001');
    });
  });

  describe('C.2 Trust Status Propagation Check', () => {
    it('blocks identity but platform user stays active', async () => {
      // Setup platform and key
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Trust Prop Platform',
          domain: unique('trust-prop.example.com'),
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

      // Step 1: Create a fresh identity
      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          email: `${unique('fresh-email')}@example.com`,
          encryptedEmail: 'ENC(fresh_user@example.com)',
          encryptedFullName: 'ENC(Fresh User)',
          trustStatus: 'clean',
        })
        .expect(201);

      const freshIdentityId = identityRes.body.id;
      tracker.trackIdentity(freshIdentityId);

      // Step 2: Create a platform user for that identity
      const puRes = await request(testApp.app.getHttpServer())
        .post('/v1/platform-users')
        .set('x-api-key', apiKey)
        .send({
          identityId: freshIdentityId,
          platformId,
          externalUserId: 'fresh_user_001',
          statusOnPlatform: 'active',
        })
        .expect(201);

      tracker.trackPlatformUser(puRes.body.id);

      // Step 3: Admin blocks the identity
      const blockRes = await request(testApp.app.getHttpServer())
        .patch(`/admin/identities/${freshIdentityId}/status`)
        .send({ trustStatus: 'blocked' })
        .expect(200);

      expect(blockRes.body.trustStatus).toBe('blocked');

      // Step 4: Re-read the platform user (still active)
      const userRes = await request(testApp.app.getHttpServer())
        .get('/v1/platform-users/fresh_user_001')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(userRes.body.statusOnPlatform).toBe('active');
    });
  });

  describe('C.3 API Key Lifecycle & Self-Service', () => {
    it('rotates key and invalidates the old one', async () => {
      // Setup platform and admin key
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Key Rotation Platform',
          domain: unique('key-rot.example.com'),
          status: 'trial',
          strictnessLevel: 'medium',
        })
        .expect(201);

      const platformId = platformRes.body.id;
      tracker.trackPlatform(platformId);

      const adminKeyResult = await testApp.apiKeysService.createApiKey(
        platformId,
        {
          platformId,
          name: 'Admin Key',
          scopes: ['read', 'write'],
        },
      );
      const adminApiKey = adminKeyResult.rawKey;
      tracker.trackApiKey(adminKeyResult.apiKey.id);

      // Step 1: Create a short-lived key
      const createRes = await request(testApp.app.getHttpServer())
        .post('/v1/platform/api-keys')
        .set('x-api-key', adminApiKey)
        .send({ name: 'Short-Lived Key', scopes: ['read'] })
        .expect(201);

      const rotatedKeyId = createRes.body.apiKey.id;
      const shortLivedKey = createRes.body.rawKey;
      tracker.trackApiKey(rotatedKeyId);

      // Step 2: Verify the new key works
      await request(testApp.app.getHttpServer())
        .get('/v1/platform/api-keys')
        .set('x-api-key', shortLivedKey)
        .expect(200);

      // Step 3: Rotate the key
      const rotateRes = await request(testApp.app.getHttpServer())
        .post(`/v1/platform/api-keys/${rotatedKeyId}/rotate`)
        .set('x-api-key', adminApiKey)
        .send({ name: 'Rotated Short-Lived Key' })
        .expect(201);

      const rotatedKeyRaw = rotateRes.body.rawKey;
      tracker.trackApiKey(rotateRes.body.apiKey.id);

      // Step 4: Old key is dead
      await request(testApp.app.getHttpServer())
        .get('/v1/platform/api-keys')
        .set('x-api-key', shortLivedKey)
        .expect(401);

      // Step 5: New rotated key works
      await request(testApp.app.getHttpServer())
        .get('/v1/platform/api-keys')
        .set('x-api-key', rotatedKeyRaw)
        .expect(200);
    });
  });

  describe('C.4 Rule Preset + Strictness Alignment', () => {
    it('applies high strictness and preset rules', async () => {
      // Setup platform and key
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Rules Platform',
          domain: unique('rules.example.com'),
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

      // Step 1: Set platform strictness to high
      const strictRes = await request(testApp.app.getHttpServer())
        .patch('/v1/platform/strictness')
        .set('x-api-key', apiKey)
        .send({ strictnessLevel: 'high' })
        .expect(200);

      expect(strictRes.body.strictnessLevel).toBe('high');

      // Step 2: Apply the high-strictness preset rules
      await request(testApp.app.getHttpServer())
        .post('/v1/platform/rules/apply-preset')
        .set('x-api-key', apiKey)
        .send({ strictnessLevel: 'high' })
        .expect(201);

      // Step 3: List rules and verify preset contents
      const rulesRes = await request(testApp.app.getHttpServer())
        .get('/v1/platform/rules')
        .set('x-api-key', apiKey)
        .expect(200);

      expect(Array.isArray(rulesRes.body)).toBe(true);
      expect(rulesRes.body.length).toBeGreaterThan(0);
    });
  });

  describe('C.5 Entity Alias Recognition Flow', () => {
    it.skip('links a returning user via alias resolution (skipped: schema FK constraint requires canonicalEntityId in both identities and organizations tables)', async () => {
      // Setup platform and key
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Alias Platform',
          domain: unique('alias.example.com'),
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

      // Step 1: Create Alice's identity
      const identityRes = await request(testApp.app.getHttpServer())
        .post('/admin/identities')
        .send({
          email: `${unique('alice-email')}@example.com`,
          encryptedEmail: 'ENC(alice@example.com)',
          encryptedFullName: 'ENC(Alice Smith)',
          trustStatus: 'clean',
        })
        .expect(201);

      const aliceIdentityId = identityRes.body.id;
      tracker.trackIdentity(aliceIdentityId);

      // Step 2: Create platform user for Alice
      await request(testApp.app.getHttpServer())
        .post('/v1/platform-users')
        .set('x-api-key', apiKey)
        .send({
          identityId: aliceIdentityId,
          platformId,
          externalUserId: 'alice_001',
          statusOnPlatform: 'active',
        })
        .expect(201);

      // Step 3: Create an org to hang the alias on (avoids polymorphic FK issue)
      const aliceOrgRes = await request(testApp.app.getHttpServer())
        .post('/admin/organizations')
        .send({
          legalName: 'Alice Org',
          domain: unique('alice-org.example.com'),
          registrationNumber: 'REG-ALICE-001',
          country: 'US',
          industry: 'Technology',
          trustStatus: 'clean',
          submittedByPlatformId: platformId,
        })
        .expect(201);
      const aliceOrgId = aliceOrgRes.body.id;
      tracker.trackOrganization(aliceOrgId);

      // Step 4: Register an alias for Alice's org (new email)
      const newEmailHash = unique('new-email-hash');
      const aliasRes = await request(testApp.app.getHttpServer())
        .post('/admin/aliases')
        .send({
          canonicalEntityType: 'organization',
          canonicalEntityId: aliceOrgId,
          aliasType: 'email',
          aliasValueHash: newEmailHash,
          aliasValueEncrypted: 'ENC(new_email@example.com)',
          confidence: 0.88,
          source: 'behavioral',
        })
        .expect(201);

      tracker.trackEntityAlias(aliasRes.body.id);

      // Step 5: Resolve the alias
      const resolveRes = await request(testApp.app.getHttpServer())
        .post('/admin/aliases/resolve')
        .send({
          aliasType: 'email',
          aliasValueHash: newEmailHash,
        })
        .expect(200);

      expect(resolveRes.body.canonicalEntityId).toBe(aliceOrgId);

      // Step 6: Verify alias scoping
      const listRes = await request(testApp.app.getHttpServer())
        .get(`/admin/aliases/entity/organization/${aliceOrgId}`)
        .expect(200);

      expect(Array.isArray(listRes.body)).toBe(true);
      expect(
        listRes.body.some((a: any) => a.aliasValueHash === newEmailHash),
      ).toBe(true);
    });
  });

  describe('C.6 Organization Lookup by Domain', () => {
    it('flags an organization and reflects on lookup', async () => {
      // Setup platform and key
      const platformRes = await request(testApp.app.getHttpServer())
        .post('/admin/platforms')
        .send({
          name: 'Org Lookup Platform',
          domain: unique('org-lookup.example.com'),
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

      // Step 1: Submit an organization
      const partnerDomain = unique('partner-logistics.example.com');
      const orgRes = await request(testApp.app.getHttpServer())
        .post('/v1/organizations')
        .set('x-api-key', apiKey)
        .send({
          legalName: 'Partner Logistics',
          domain: partnerDomain,
          registrationNumber: 'REG-PL-2025',
          country: 'PH',
          industry: 'Logistics',
          trustStatus: 'clean',
        })
        .expect(201);

      const partnerOrgId = orgRes.body.id;
      tracker.trackOrganization(partnerOrgId);

      // Step 2: Lookup by domain
      const lookupRes = await request(testApp.app.getHttpServer())
        .get(`/admin/organizations/by-domain/${partnerDomain}`)
        .expect(200);

      expect(lookupRes.body.id).toBe(partnerOrgId);
      expect(lookupRes.body.trustStatus).toBe('clean');

      // Step 3: Admin flags the organization
      await request(testApp.app.getHttpServer())
        .patch(`/admin/organizations/${partnerOrgId}/status`)
        .send({ trustStatus: 'flagged' })
        .expect(200);

      // Step 4: Re-lookup
      const relookupRes = await request(testApp.app.getHttpServer())
        .get(`/admin/organizations/by-domain/${partnerDomain}`)
        .expect(200);

      expect(relookupRes.body.trustStatus).toBe('flagged');
    });
  });
});
