import { Client } from 'pg'

/**
 * Clean up all test data from the three demo app databases.
 * Deletes users with emails ending in @e2e.local.
 * Cascading deletes in Prisma schemas handle related records.
 */

const DB_URLS = {
  apiStore: 'postgresql://user:trustlayer123@127.0.0.1:5501/demo-api-store',
  jobBoard: 'postgresql://user:trustlayer123@127.0.0.1:5501/demo-job-board',
  socialMedia: 'postgresql://user:trustlayer123@127.0.0.1:5501/demo-social-media',
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
    await safeDelete(`DELETE FROM "Account" WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
    await safeDelete(`DELETE FROM "Session" WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
    // Also try lowercase table names (some setups use them)
    await safeDelete(`DELETE FROM accounts WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
    await safeDelete(`DELETE FROM sessions WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)

    // API Store specific tables
    if (name === 'apiStore') {
      await safeDelete(`DELETE FROM api_usage_logs WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
      await safeDelete(`DELETE FROM free_trials WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
      await safeDelete(`DELETE FROM credit_transactions WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
      await safeDelete(`DELETE FROM user_api_keys WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
      await safeDelete(`DELETE FROM api_endpoints WHERE "orgProfileId" IN (SELECT id FROM organization_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local'))`)
    }

    // Job Board specific tables
    if (name === 'jobBoard') {
      await safeDelete(`DELETE FROM applications WHERE "individualId" IN (SELECT id FROM individual_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local'))`)
      await safeDelete(`DELETE FROM jobs WHERE "organizationId" IN (SELECT id FROM organization_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local'))`)
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
      await safeDelete(`DELETE FROM comments WHERE "authorId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
      await safeDelete(`DELETE FROM likes WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
      await safeDelete(`DELETE FROM follows WHERE "followerId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local') OR "followingId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
      await safeDelete(`DELETE FROM posts WHERE "authorId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
    }

    // Delete profile tables
    await safeDelete(`DELETE FROM individual_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)
    await safeDelete(`DELETE FROM organization_profiles WHERE "userId" IN (SELECT id FROM users WHERE email LIKE '%@e2e.local')`)

    // Finally delete users
    const result = await client.query(`DELETE FROM users WHERE email LIKE '%@e2e.local' RETURNING email`)
    console.log(`[${name}] Deleted ${result.rowCount} test users`)
  } catch (err) {
    console.error(`[${name}] Cleanup error:`, err)
    throw err
  } finally {
    await client.end()
  }
}

export async function cleanupAll() {
  console.log('Starting cleanup of all test data...')
  await cleanupDb('apiStore', DB_URLS.apiStore)
  await cleanupDb('jobBoard', DB_URLS.jobBoard)
  await cleanupDb('socialMedia', DB_URLS.socialMedia)
  console.log('Cleanup complete.')
}

// Run directly if executed as script
if (require.main === module) {
  cleanupAll().catch((err) => {
    console.error('Cleanup failed:', err)
    process.exit(1)
  })
}
