/**
 * Seed script: creates the 3 demo platforms in TrustLayer and generates an API key per platform.
 * Run with: npx ts-node -r tsconfig-paths/register scripts/seed-demo-platforms.ts
 *
 * Requires apps/api to be running on http://localhost:8090
 * Paste the printed keys into each demo app's .env.local
 */

const BASE_URL = 'http://localhost:8090';

interface Platform {
  id: string;
  name: string;
  domain: string;
  strictnessLevel: string;
  status: string;
}

interface ApiKeyResult {
  apiKey: { id: string; name: string };
  rawKey: string;
}

async function createPlatform(params: {
  name: string;
  domain: string;
  strictnessLevel: string;
}): Promise<Platform> {
  const res = await fetch(`${BASE_URL}/admin/platforms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Failed to create platform "${params.name}": ${res.status} ${body}`,
    );
  }
  return res.json() as Promise<Platform>;
}

async function createApiKey(
  platformId: string,
  name: string,
): Promise<ApiKeyResult> {
  const res = await fetch(
    `${BASE_URL}/admin/platforms/${platformId}/api-keys`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, scopes: [] }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Failed to create API key for platform ${platformId}: ${res.status} ${body}`,
    );
  }
  return res.json() as Promise<ApiKeyResult>;
}

async function main() {
  console.log('🚀 Seeding demo platforms...\n');

  const demos = [
    {
      name: 'API Store',
      domain: 'api-store.demo',
      strictnessLevel: 'medium',
      envFile: 'apps/demo/api-store/.env.local',
    },
    {
      name: 'Job Board',
      domain: 'job-board.demo',
      strictnessLevel: 'low',
      envFile: 'apps/demo/job-board/.env.local',
    },
    {
      name: 'Social Media App',
      domain: 'social-media.demo',
      strictnessLevel: 'medium',
      envFile: 'apps/demo/social-media-app/.env.local',
    },
  ];

  for (const demo of demos) {
    let platform: Platform;
    try {
      platform = await createPlatform({
        name: demo.name,
        domain: demo.domain,
        strictnessLevel: demo.strictnessLevel,
      });
      console.log(`✅ Created platform: ${demo.name} (id: ${platform.id})`);
    } catch (err) {
      console.error(`❌ ${String(err)}`);
      continue;
    }

    let keyResult: ApiKeyResult;
    try {
      keyResult = await createApiKey(platform.id, `${demo.name} Demo Key`);
    } catch (err) {
      console.error(`❌ ${String(err)}`);
      continue;
    }

    console.log(`\n📋 Add to ${demo.envFile}:`);
    console.log(`   TRUSTLAYER_API_URL=http://localhost:8090`);
    console.log(`   TRUSTLAYER_API_KEY=${keyResult.rawKey}`);
    console.log(`   TRUSTLAYER_PLATFORM_ID=${platform.id}`);
    console.log('');
  }

  console.log(
    '✅ Done. Copy the env vars above into each demo app .env.local file.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
