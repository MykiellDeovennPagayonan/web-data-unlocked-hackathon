import { Flow } from '@/types';

export const flows: Flow[] = [
  {
    id: 'registration-trust-evaluation',
    title: '1. Registration-Time Trust Evaluation: The Gate',
    description: 'A new user hits the platform and TrustLayer decides to flag them before they get inside.',
    category: 'core',
    steps: [
      {
        id: 'step-1-1',
        number: 1,
        title: 'Create a high-strictness platform',
        method: 'POST',
        endpoint: '/admin/platforms',
        headers: { 'Content-Type': 'application/json' },
        body: {
          name: 'E-Shop Gamma',
          domain: 'eshop-gamma.example.com',
          status: 'trial',
          strictnessLevel: 'high'
        },
        variablesUsed: [],
        variablesCreated: ['PLATFORM_A_ID'],
        expectedOutput: { id: '<PLATFORM_A_ID>', name: 'E-Shop Gamma', strictnessLevel: 'high' }
      },
      {
        id: 'step-1-2',
        number: 2,
        title: 'Create the first API key for Platform A',
        method: 'POST',
        endpoint: '/admin/api-keys/platforms/$PLATFORM_A_ID',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'Bootstrap Key', scopes: ['read', 'write'] },
        variablesUsed: ['PLATFORM_A_ID'],
        variablesCreated: ['API_KEY_A'],
        expectedOutput: { apiKey: { id: '...', name: 'Bootstrap Key' }, rawKey: '<RAW_KEY>' }
      },
      {
        id: 'step-1-3',
        number: 3,
        title: 'Create a global identity',
        method: 'POST',
        endpoint: '/admin/identities',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: 'reg@example.com',
          encryptedEmail: '',
          encryptedFullName: '',
          trustStatus: 'clean'
        },
        variablesUsed: [],
        variablesCreated: ['IDENTITY_ID'],
        expectedOutput: { id: '<IDENTITY_ID>', emailHash: '<SHA-256_HASH_OF_EMAIL>', trustStatus: 'clean' }
      },
      {
        id: 'step-1-4',
        number: 4,
        title: 'Resolve device fingerprint',
        method: 'POST',
        endpoint: '/v1/intelligence/device',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: {
          signals: [
            { signalType: 'canvas_hash', value: 'canvas_reg_001' },
            { signalType: 'webgl_hash', value: 'webgl_reg_001' },
            { signalType: 'screen_resolution', value: '1920x1080' },
            { signalType: 'os', value: 'macOS' },
            { signalType: 'timezone', value: 'Asia/Manila' },
            { signalType: 'user_agent', value: 'Mozilla/5.0' },
            { signalType: 'browser', value: 'Chrome' },
            { signalType: 'language', value: 'en-US' }
          ]
        },
        variablesUsed: ['API_KEY_A'],
        variablesCreated: ['DEVICE_ID'],
        expectedOutput: { device: { id: '<DEVICE_ID>', riskScore: 0, isFlagged: false }, isNew: true }
      },
      {
        id: 'step-1-5',
        number: 5,
        title: 'Evaluate IP intelligence',
        method: 'POST',
        endpoint: '/v1/intelligence/ip',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: { ipAddress: '8.8.8.8' },
        variablesUsed: ['API_KEY_A'],
        variablesCreated: ['IP_ID'],
        expectedOutput: { id: '<IP_ID>', ipAddress: '8.8.8.8', ipType: 'residential', riskScore: 10 }
      },
      {
        id: 'step-1-6',
        number: 6,
        title: 'Create platform user',
        method: 'POST',
        endpoint: '/v1/platform-users',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: {
          identityId: '$IDENTITY_ID',
          platformId: '$PLATFORM_A_ID',
          externalUserId: 'reg_user_001',
          statusOnPlatform: 'active'
        },
        variablesUsed: ['API_KEY_A', 'IDENTITY_ID', 'PLATFORM_A_ID'],
        variablesCreated: ['PLATFORM_USER_ID'],
        expectedOutput: { id: '<PLATFORM_USER_ID>', externalUserId: 'reg_user_001', statusOnPlatform: 'active' }
      },
      {
        id: 'step-1-7',
        number: 7,
        title: 'Trigger registration-time background check',
        method: 'POST',
        endpoint: '/v1/background-checks',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: {
          entityType: 'identity',
          identityId: '$IDENTITY_ID',
          triggeredBy: 'registration'
        },
        variablesUsed: ['API_KEY_A', 'IDENTITY_ID'],
        variablesCreated: ['CHECK_ID'],
        expectedOutput: { id: '<CHECK_ID>', entityType: 'identity', overallVerdict: 'clean' }
      },
      {
        id: 'step-1-8',
        number: 8,
        title: 'Add mixed results (one soft flag)',
        method: 'POST',
        endpoint: '/v1/background-checks/$CHECK_ID/results',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: {
          source: 'serp',
          rawResult: { results: [{ title: 'Adverse mention' }] },
          normalizedVerdict: 'soft_flag',
          confidenceScore: 0.7,
          llmSummary: 'Adverse mention in search results.'
        },
        variablesUsed: ['API_KEY_A', 'CHECK_ID'],
        variablesCreated: [],
        expectedOutput: { checkId: '<CHECK_ID>', source: 'serp', normalizedVerdict: 'soft_flag' }
      },
      {
        id: 'step-1-9',
        number: 9,
        title: 'Complete the check as flagged',
        method: 'POST',
        endpoint: '/v1/background-checks/$CHECK_ID/complete',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: { overallVerdict: 'flagged' },
        variablesUsed: ['API_KEY_A', 'CHECK_ID'],
        variablesCreated: [],
        expectedOutput: { id: '<CHECK_ID>', overallVerdict: 'flagged' }
      },
      {
        id: 'step-1-10',
        number: 10,
        title: 'Verify trust score dropped',
        method: 'GET',
        endpoint: '/v1/trust-score/identity/$IDENTITY_ID',
        headers: { 'x-api-key': '$API_KEY_A' },
        body: null,
        variablesUsed: ['API_KEY_A', 'IDENTITY_ID'],
        variablesCreated: [],
        expectedOutput: { score: 45, signalCount: 1 }
      },
      {
        id: 'step-1-11',
        number: 11,
        title: 'Log a flagged registration access event',
        method: 'POST',
        endpoint: '/v1/access/events',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: {
          platformId: '$PLATFORM_A_ID',
          identityId: '$IDENTITY_ID',
          ipId: '$IP_ID',
          deviceId: '$DEVICE_ID',
          eventType: 'registration',
          verdict: 'flagged',
          scoreAtEvent: 45,
          triggeredRules: { trustScoreBelow: 50 }
        },
        variablesUsed: ['API_KEY_A', 'PLATFORM_A_ID', 'IDENTITY_ID', 'IP_ID', 'DEVICE_ID'],
        variablesCreated: ['ACCESS_EVENT_ID'],
        expectedOutput: { id: '<ACCESS_EVENT_ID>', eventType: 'registration', verdict: 'flagged' }
      }
    ]
  },
  {
    id: 'portable-trust-certificate',
    title: '2. Portable Trust Certificate: Cross-Platform Whitelist',
    description: 'A verified identity carries portable trust from Platform A to Platform B.',
    category: 'core',
    steps: [
      {
        id: 'step-2-1',
        number: 1,
        title: 'Platform A: create platform + key',
        description: 'Same as Flow 1 Step 1. Save PLATFORM_A_ID and API_KEY_A.',
        method: 'POST',
        endpoint: '/admin/platforms',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'E-Shop Alpha', domain: 'eshop-alpha.example.com', status: 'trial', strictnessLevel: 'high' },
        variablesUsed: [],
        variablesCreated: ['PLATFORM_A_ID'],
        expectedOutput: { id: '<PLATFORM_A_ID>' }
      },
      {
        id: 'step-2-2',
        number: 2,
        title: 'Create API key for Platform A',
        method: 'POST',
        endpoint: '/admin/api-keys/platforms/$PLATFORM_A_ID',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'Bootstrap Key', scopes: ['read', 'write'] },
        variablesUsed: ['PLATFORM_A_ID'],
        variablesCreated: ['API_KEY_A'],
        expectedOutput: { apiKey: { id: '...' }, rawKey: '<RAW_KEY>' }
      },
      {
        id: 'step-2-3',
        number: 3,
        title: 'Create identity + trigger background check',
        description: 'Same as Flow 1 Steps 3-7. Save IDENTITY_ID and CHECK_ID.',
        method: 'POST',
        endpoint: '/admin/identities',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'certified@example.com', encryptedEmail: '', encryptedFullName: '', trustStatus: 'clean' },
        variablesUsed: [],
        variablesCreated: ['IDENTITY_ID'],
        expectedOutput: { id: '<IDENTITY_ID>' }
      },
      {
        id: 'step-2-4',
        number: 4,
        title: 'Trigger background check',
        method: 'POST',
        endpoint: '/v1/background-checks',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: { entityType: 'identity', identityId: '$IDENTITY_ID', triggeredBy: 'manual' },
        variablesUsed: ['API_KEY_A', 'IDENTITY_ID'],
        variablesCreated: ['CHECK_ID'],
        expectedOutput: { id: '<CHECK_ID>' }
      },
      {
        id: 'step-2-5',
        number: 5,
        title: 'Add all-clear results',
        description: 'Add OFAC, LinkedIn, OpenSanctions, and SERP results.',
        method: 'POST',
        endpoint: '/v1/background-checks/$CHECK_ID/results',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: { source: 'ofac', rawResult: { matches: [] }, normalizedVerdict: 'clear', confidenceScore: 0.95, llmSummary: 'No adverse findings.' },
        variablesUsed: ['API_KEY_A', 'CHECK_ID'],
        variablesCreated: [],
        expectedOutput: { id: '...', checkId: '<CHECK_ID>' }
      },
      {
        id: 'step-2-6',
        number: 6,
        title: 'Complete check as clean',
        method: 'POST',
        endpoint: '/v1/background-checks/$CHECK_ID/complete',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: { overallVerdict: 'clean' },
        variablesUsed: ['API_KEY_A', 'CHECK_ID'],
        variablesCreated: [],
        expectedOutput: { overallVerdict: 'clean', completedAt: '2026-...' }
      },
      {
        id: 'step-2-7',
        number: 7,
        title: 'Issue a Trust Certificate (30 days)',
        method: 'POST',
        endpoint: '/v1/trust-certificates',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_A' },
        body: { entityType: 'identity', identityId: '$IDENTITY_ID', issuingCheckId: '$CHECK_ID', validDays: 30 },
        variablesUsed: ['API_KEY_A', 'IDENTITY_ID', 'CHECK_ID'],
        variablesCreated: ['CERTIFICATE_ID'],
        expectedOutput: { id: '<CERTIFICATE_ID>', status: 'active', certificateHash: 'sha256:...' }
      },
      {
        id: 'step-2-8',
        number: 8,
        title: 'Create Platform B',
        method: 'POST',
        endpoint: '/admin/platforms',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'Verifier Platform', domain: 'verifier.example.com', status: 'trial', strictnessLevel: 'medium' },
        variablesUsed: [],
        variablesCreated: ['PLATFORM_B_ID'],
        expectedOutput: { id: '<PLATFORM_B_ID>' }
      },
      {
        id: 'step-2-9',
        number: 9,
        title: 'Create API key for Platform B',
        method: 'POST',
        endpoint: '/admin/api-keys/platforms/$PLATFORM_B_ID',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'Bootstrap Key', scopes: ['read', 'write'] },
        variablesUsed: ['PLATFORM_B_ID'],
        variablesCreated: ['API_KEY_B'],
        expectedOutput: { apiKey: { id: '...' }, rawKey: '<RAW_KEY>' }
      },
      {
        id: 'step-2-10',
        number: 10,
        title: 'Platform B verifies the certificate',
        method: 'POST',
        endpoint: '/v1/certificate-verifications/$CERTIFICATE_ID',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_B' },
        body: { verifiedByPlatformId: '$PLATFORM_B_ID' },
        variablesUsed: ['API_KEY_B', 'CERTIFICATE_ID', 'PLATFORM_B_ID'],
        variablesCreated: ['VERIFICATION_ID'],
        expectedOutput: { id: '<VERIFICATION_ID>', verdict: 'valid' }
      }
    ]
  },
  {
    id: 'community-reporting',
    title: '3. Community Reporting Network Effect',
    description: 'Three platforms report the same identity; the network auto-escalates the blacklist.',
    category: 'core',
    steps: [
      {
        id: 'step-3-1',
        number: 1,
        title: 'Create 3 platforms',
        method: 'POST',
        endpoint: '/admin/platforms',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'Platform X', domain: 'platform-x.example.com', status: 'trial', strictnessLevel: 'medium' },
        variablesUsed: [],
        variablesCreated: ['PLATFORM_X_ID'],
        expectedOutput: { id: '<PLATFORM_X_ID>' }
      },
      {
        id: 'step-3-2',
        number: 2,
        title: 'Create shared identity',
        method: 'POST',
        endpoint: '/admin/identities',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'bad@actor.com', encryptedEmail: '', encryptedFullName: '', trustStatus: 'clean' },
        variablesUsed: [],
        variablesCreated: ['SHARED_IDENTITY_ID'],
        expectedOutput: { id: '<SHARED_IDENTITY_ID>', score: 50 }
      },
      {
        id: 'step-3-3',
        number: 3,
        title: 'Create API key for Platform X',
        method: 'POST',
        endpoint: '/admin/api-keys/platforms/$PLATFORM_X_ID',
        headers: { 'Content-Type': 'application/json' },
        body: { name: 'Bootstrap Key', scopes: ['read', 'write'] },
        variablesUsed: ['PLATFORM_X_ID'],
        variablesCreated: ['API_KEY_X'],
        expectedOutput: { apiKey: { id: '...' }, rawKey: '<RAW_KEY>' }
      },
      {
        id: 'step-3-4',
        number: 4,
        title: 'Baseline trust score',
        method: 'GET',
        endpoint: '/v1/trust-score/identity/$SHARED_IDENTITY_ID',
        headers: { 'x-api-key': '$API_KEY_X' },
        body: null,
        variablesUsed: ['API_KEY_X', 'SHARED_IDENTITY_ID'],
        variablesCreated: [],
        expectedOutput: { score: 50, signalCount: 0 }
      },
      {
        id: 'step-3-5',
        number: 5,
        title: 'Submit community report',
        method: 'POST',
        endpoint: '/v1/registry/community-reports',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '$API_KEY_X' },
        body: { reportingPlatformId: '$PLATFORM_X_ID', targetType: 'identity', identityId: '$SHARED_IDENTITY_ID', severity: 'high', category: 'fraud', description: 'Confirmed chargeback fraud.' },
        variablesUsed: ['API_KEY_X', 'PLATFORM_X_ID', 'SHARED_IDENTITY_ID'],
        variablesCreated: ['REPORT_X_ID'],
        expectedOutput: { id: '<REPORT_X_ID>' }
      },
      {
        id: 'step-3-6',
        number: 6,
        title: 'Admin accepts report',
        method: 'POST',
        endpoint: '/admin/community-reports/$REPORT_X_ID/accept',
        headers: { 'Content-Type': 'application/json' },
        body: { severity: 'orange_watch' },
        variablesUsed: ['REPORT_X_ID'],
        variablesCreated: [],
        expectedOutput: { registryEntryId: '...' }
      },
      {
        id: 'step-3-7',
        number: 7,
        title: 'Verify trust score degraded',
        method: 'GET',
        endpoint: '/v1/trust-score/identity/$SHARED_IDENTITY_ID',
        headers: { 'x-api-key': '$API_KEY_X' },
        body: null,
        variablesUsed: ['API_KEY_X', 'SHARED_IDENTITY_ID'],
        variablesCreated: [],
        expectedOutput: { score: 30, signalCount: 1 }
      },
      {
        id: 'step-3-8',
        number: 8,
        title: 'Verify active blacklist entries',
        method: 'GET',
        endpoint: '/admin/registry/entries?listType=blacklist&isActive=true',
        headers: {},
        body: null,
        variablesUsed: [],
        variablesCreated: [],
        expectedOutput: [{ listType: 'blacklist', severity: 'orange_watch', isActive: true }]
      }
    ]
  }
];

// For now, include first 3 flows to keep file manageable
// Additional flows can be added incrementally
export const getFlowById = (id: string): Flow | undefined => {
  return flows.find(f => f.id === id);
};

export const getFlowsByCategory = (category: Flow['category']): Flow[] => {
  return flows.filter(f => f.category === category);
};
