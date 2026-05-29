/**
 * Seed script: creates the 3 demo platforms in TrustLayer, generates API keys,
 * and writes TRUSTLAYER_* vars directly into each demo app's .env.local.
 *
 * Run from the monorepo root:
 *   npx ts-node -r tsconfig-paths/register apps/api/scripts/seed-demo-platforms.ts
 *
 * Requires apps/api to be running on http://localhost:8090
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.TRUSTLAYER_API_URL ?? 'http://localhost:8090';
const REPO_ROOT = path.resolve(__dirname, '../../..');

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
      body: JSON.stringify({ name, scopes: ['read', 'write'] }),
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

function writeEnvVars(envFilePath: string, vars: Record<string, string>): void {
  let content = fs.readFileSync(envFilePath, 'utf-8');

  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}="${value}"`;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content = content.trimEnd() + `\n${line}\n`;
    }
  }

  fs.writeFileSync(envFilePath, content, 'utf-8');
}

async function main() {
  console.log(`\n🚀 Seeding demo platforms against ${BASE_URL}\n`);

  const demos = [
    {
      name: 'API Store',
      domain: 'api-store.demo',
      strictnessLevel: 'high',
      envFile: 'apps/demo/api-store/.env.local',
    },
    {
      name: 'Job Board',
      domain: 'job-board.demo',
      strictnessLevel: 'medium',
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
    process.stdout.write(`  ${demo.name}... `);

    let platform: Platform;
    try {
      platform = await createPlatform({
        name: demo.name,
        domain: demo.domain,
        strictnessLevel: demo.strictnessLevel,
      });
    } catch (err) {
      console.error(`\n  ❌ ${String(err)}`);
      continue;
    }

    let keyResult: ApiKeyResult;
    try {
      keyResult = await createApiKey(platform.id, `${demo.name} Demo Key`);
    } catch (err) {
      console.error(`\n  ❌ ${String(err)}`);
      continue;
    }

    const envFilePath = path.join(REPO_ROOT, demo.envFile);
    writeEnvVars(envFilePath, {
      TRUSTLAYER_API_URL: BASE_URL,
      TRUSTLAYER_API_KEY: keyResult.rawKey,
      TRUSTLAYER_PLATFORM_ID: platform.id,
    });

    console.log(`✅`);
    console.log(`     platform_id : ${platform.id}`);
    console.log(`     api_key     : ${keyResult.rawKey}`);
    console.log(`     written to  : ${demo.envFile}\n`);
  }

  console.log('✅ All done — demo apps are ready to start.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
