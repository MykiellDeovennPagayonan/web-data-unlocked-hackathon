import { Client } from 'pg'
import Redis from 'ioredis'

/**
 * Clean up all test data from the three demo app databases.
 * Deletes users with emails ending in @e2e.local.
 * Cascading deletes in Prisma schemas handle related records.
 */

const DB_URLS = {
  apiStore: 'postgresql://user:trustlayer123@127.0.0.1:5501/demo-api-store',
  jobBoard: 'postgresql://user:trustlayer123@127.0.0.1:5501/demo-job-board',
  socialMedia: 'postgresql://user:trustlayer123@127.0.0.1:5501/demo-social-media',
  trustLayer: 'postgresql://user:trustlayer123@127.0.0.1:5501/trust-later',
}

async function cleanupDb(name: string, url: string) {
  const client = new Client({ connectionString: url })
  try {
    await client.connect()

    async function safeDelete(sql: string) {
      try {
        await client.query(sql)
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string }
        // Ignore missing table (42P01) or missing column (42703) errors
        if (e.code === '42P01' || e.code === '42703') {
          console.log(`[${name}] Skipped: ${e.message}`)
        } else {
          throw err
        }
      }
    }

    // Delete from child tables first to avoid FK constraint issues
    // NextAuth tables (camelCase columns from adapter)
    await safeDelete(`DELETE FROM "Account" WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
    await safeDelete(`DELETE FROM "Session" WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
    // Also try lowercase table names (some setups use them)
    await safeDelete(`DELETE FROM accounts WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
    await safeDelete(`DELETE FROM sessions WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)

    // API Store specific tables
    if (name === 'apiStore') {
      await safeDelete(`DELETE FROM api_usage_logs WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
      await safeDelete(`DELETE FROM free_trials WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
      await safeDelete(`DELETE FROM credit_transactions WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
      await safeDelete(`DELETE FROM user_api_keys WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
      await safeDelete(`DELETE FROM api_endpoints WHERE "orgProfileId" IN (SELECT id FROM organization_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%'))`)
    }

    // Job Board specific tables
    if (name === 'jobBoard') {
      await safeDelete(`DELETE FROM applications WHERE "individualId" IN (SELECT id FROM individual_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%'))`)
      await safeDelete(`DELETE FROM jobs WHERE "organizationId" IN (SELECT id FROM organization_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%'))`)
    }

    // Social Media specific tables
    let socialMediaCleaned = false
    if (name === 'socialMedia') {
      try {
        const res = await fetch('http://localhost:3001/api/seed', {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer dev-seed-secret',
          },
        })
        if (res.ok) {
          console.log(`[socialMedia] Cleanup via API`)
          socialMediaCleaned = true
        }
      } catch {
        // fallback to raw SQL if API is unavailable
      }
    }

    if (name === 'socialMedia' && !socialMediaCleaned) {
      await safeDelete(`DELETE FROM comments WHERE "authorId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
      await safeDelete(`DELETE FROM likes WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
      await safeDelete(`DELETE FROM follows WHERE "followerId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%') OR "followingId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
      await safeDelete(`DELETE FROM posts WHERE "authorId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
    }

    // Delete profile tables
    await safeDelete(`DELETE FROM individual_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)
    await safeDelete(`DELETE FROM organization_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%')`)

    // Finally delete users
    const result = await client.query(`DELETE FROM users WHERE email LIKE '%@e2e.local' OR email LIKE 'f2-%' RETURNING email`)
    console.log(`[${name}] Deleted ${result.rowCount} test users`)
  } catch (err) {
    console.error(`[${name}] Cleanup error:`, err)
    throw err
  } finally {
    await client.end()
  }
}

async function cleanupTrustLayer(url: string) {
  const client = new Client({ connectionString: url })
  try {
    await client.connect()

    async function safeDelete(sql: string) {
      try {
        const result = await client.query(sql)
        return result.rowCount ?? 0
      } catch (err: unknown) {
        const e = err as { code?: string; message?: string }
        if (e.code === '42P01' || e.code === '42703') {
          console.log(`[trustLayer] Skipped: ${e.message}`)
          return 0
        }
        throw err
      }
    }

    // Delete child records first to respect FK constraints
    // NOTE: TrustLayer schema uses camelCase column names (Prisma default without @map on fields)
    const counts: Record<string, number> = {}

    counts.certificate_verifications = await safeDelete(`DELETE FROM certificate_verifications`)
    counts.trust_certificates = await safeDelete(`DELETE FROM trust_certificates`)
    counts.trust_signals = await safeDelete(`DELETE FROM trust_signals`)
    counts.entity_aliases = await safeDelete(`DELETE FROM entity_aliases`)
    counts.platform_users = await safeDelete(`DELETE FROM platform_users`)
    counts.access_events = await safeDelete(`DELETE FROM access_events`)
    counts.sessions = await safeDelete(`DELETE FROM sessions`)
    counts.device_signals = await safeDelete(`DELETE FROM device_signals`)
    counts.devices = await safeDelete(`DELETE FROM devices`)
    counts.identities = await safeDelete(`DELETE FROM identities`)
    counts.organizations = await safeDelete(`DELETE FROM organizations`)

    // Wipe test IP records (TEST-NET-3 range used by Flow 3)
    counts.ip_records = await safeDelete(`DELETE FROM ip_records WHERE "ipAddress"::text LIKE '203.0.113.%'`)

    const total = Object.values(counts).reduce((sum, c) => sum + c, 0)
    console.log(`[trustLayer] Cleaned up ${total} test records`, counts)
  } catch (err) {
    console.error('[trustLayer] Cleanup error:', err)
    throw err
  } finally {
    await client.end()
  }
}

async function unbanLocalhostIps() {
  for (const ip of ['127.0.0.1', '::1']) {
    try {
      const res = await fetch(`http://localhost:8090/admin/ip/${encodeURIComponent(ip)}/unban`, {
        method: 'POST',
      })
      if (res.ok) {
        const json = await res.json()
        console.log(`[trustLayer] Unbanned ${ip}: ${json.count} record(s) cleared`)
      }
    } catch {
      // Non-fatal — API may not be running
    }
  }
}

async function cleanupRedis() {
  try {
    const redis = new Redis({
      host: '127.0.0.1',
      port: 56380,
    })

    // Clear all API velocity counters from Redis
    const velocityKeys = await redis.keys('identity_api_velocity:*')
    if (velocityKeys.length > 0) {
      await redis.del(...velocityKeys)
      console.log(`[redis] Cleared ${velocityKeys.length} identity velocity counter keys`)
    }

    // Clear IP velocity and probe keys (used by Flow 3 bot detection)
    const ipVelocityKeys = await redis.keys('ip_velocity:*')
    if (ipVelocityKeys.length > 0) {
      await redis.del(...ipVelocityKeys)
      console.log(`[redis] Cleared ${ipVelocityKeys.length} ip_velocity keys`)
    }
    const ipProbeKeys = await redis.keys('ip_probe:*')
    if (ipProbeKeys.length > 0) {
      await redis.del(...ipProbeKeys)
      console.log(`[redis] Cleared ${ipProbeKeys.length} ip_probe keys`)
    }

    if (velocityKeys.length === 0 && ipVelocityKeys.length === 0 && ipProbeKeys.length === 0) {
      console.log('[redis] No velocity/probe keys to clear')
    }

    await redis.quit()
  } catch (err) {
    console.error('[redis] Cleanup error:', err)
    // Non-fatal — Redis may not be running
  }
}

export async function cleanupAll() {
  console.log('Starting cleanup of all test data...')
  await cleanupDb('apiStore', DB_URLS.apiStore)
  await cleanupDb('jobBoard', DB_URLS.jobBoard)
  await cleanupDb('socialMedia', DB_URLS.socialMedia)
  await cleanupTrustLayer(DB_URLS.trustLayer)
  await unbanLocalhostIps()
  await cleanupRedis()
  console.log('Cleanup complete.')
}

// Run directly if executed as script
if (require.main === module) {
  cleanupAll().catch((err) => {
    console.error('Cleanup failed:', err)
    process.exit(1)
  })
}
