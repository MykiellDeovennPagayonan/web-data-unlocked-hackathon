import { Client } from 'pg'

/**
 * Clean up admin dashboard seed data from the main Tunai database.
 * Deletes all records created by `seed-admin-dashboard.ts` for the
 * platform with domain `acme-admin-seed.local` and its associated identities.
 */

const MAIN_DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://user:trustlayer123@127.0.0.1:5501/trust-later'

const SEED_DOMAIN = 'acme-admin-seed.local'

async function safeQuery(client: Client, sql: string) {
  try {
    await client.query(sql)
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    if (e.code === '42P01' || e.code === '42703') {
      console.log(`[cleanup-admin] Skipped: ${e.message}`)
    } else {
      throw err
    }
  }
}

export async function cleanupAdminDashboard(): Promise<void> {
  console.log('Starting cleanup of admin dashboard seed data...')
  const client = new Client({ connectionString: MAIN_DB_URL })

  try {
    await client.connect()

    // Find the seeded platform
    const platformResult = await client.query(
      `SELECT id FROM platforms WHERE domain = $1`,
      [SEED_DOMAIN],
    )
    const platformId =
      platformResult.rows.length > 0 ? platformResult.rows[0].id : null

    if (!platformId) {
      console.log('[cleanup-admin] No seed platform found, nothing to clean.')
      return
    }

    console.log(`[cleanup-admin] Found seed platform: ${platformId}`)

    // Find seeded identities by their known email hashes
    const identityHashes = [
      'jane.doe@acme.com',
      'service-account-1',
      'mobile_user_392',
      'admin@acme.com',
      'api-user',
      'batch@acme.com',
      'contractor.user',
      'infra-id@acme.com',
    ]

    // Build hashes - the seed uses sha256, but we can match on encryptedEmail
    // or find via platform users
    const identityResult = await client.query(
      `SELECT id FROM identities WHERE "encryptedEmail" = ANY($1)`,
      [identityHashes],
    )
    const seedIdentityIds = identityResult.rows.map((r) => r.id)

    // Delete child records tied to the platform
    await safeQuery(
      client,
      `DELETE FROM "AccessEvent" WHERE "platformId" = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM access_events WHERE platform_id = '${platformId}'`,
    )

    await safeQuery(
      client,
      `DELETE FROM "BehavioralEvent" WHERE "platformId" = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM behavioral_events WHERE platform_id = '${platformId}'`,
    )

    await safeQuery(
      client,
      `DELETE FROM "Session" WHERE "platformId" = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM sessions WHERE platform_id = '${platformId}'`,
    )

    await safeQuery(
      client,
      `DELETE FROM "WebhookDeliveryLog" WHERE "platformId" = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM webhook_delivery_logs WHERE platform_id = '${platformId}'`,
    )

    await safeQuery(
      client,
      `DELETE FROM "VerificationRequest" WHERE "platformId" = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM verification_requests WHERE platform_id = '${platformId}'`,
    )

    await safeQuery(
      client,
      `DELETE FROM "CommunityReport" WHERE "reportingPlatformId" = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM community_reports WHERE reporting_platform_id = '${platformId}'`,
    )

    await safeQuery(
      client,
      `DELETE FROM "PlatformUser" WHERE "platformId" = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM platform_users WHERE platform_id = '${platformId}'`,
    )

    // Clean up certificates and background checks for seed identities
    if (seedIdentityIds.length > 0) {
      const ids = seedIdentityIds.map((id) => `'${id}'`).join(',')

      await safeQuery(
        client,
        `DELETE FROM "CertificateVerification" WHERE "certificateId" IN (SELECT id FROM "TrustCertificate" WHERE "identityId" IN (${ids}))`,
      )
      await safeQuery(
        client,
        `DELETE FROM certificate_verifications WHERE certificate_id IN (SELECT id FROM trust_certificates WHERE identity_id IN (${ids}))`,
      )

      await safeQuery(
        client,
        `DELETE FROM "TrustCertificate" WHERE "identityId" IN (${ids})`,
      )
      await safeQuery(
        client,
        `DELETE FROM trust_certificates WHERE identity_id IN (${ids})`,
      )

      await safeQuery(
        client,
        `DELETE FROM "BackgroundCheckResult" WHERE "checkId" IN (SELECT id FROM "BackgroundCheck" WHERE "identityId" IN (${ids}))`,
      )
      await safeQuery(
        client,
        `DELETE FROM background_check_results WHERE check_id IN (SELECT id FROM background_checks WHERE identity_id IN (${ids}))`,
      )

      await safeQuery(
        client,
        `DELETE FROM "BackgroundCheck" WHERE "identityId" IN (${ids})`,
      )
      await safeQuery(
        client,
        `DELETE FROM background_checks WHERE identity_id IN (${ids})`,
      )

      await safeQuery(
        client,
        `DELETE FROM "Identity" WHERE id IN (${ids})`,
      )
      await safeQuery(
        client,
        `DELETE FROM identities WHERE id IN (${ids})`,
      )
    }

    // Finally delete the platform
    await safeQuery(
      client,
      `DELETE FROM "Platform" WHERE id = '${platformId}'`,
    )
    await safeQuery(
      client,
      `DELETE FROM platforms WHERE id = '${platformId}'`,
    )

    console.log('[cleanup-admin] Cleanup complete.')
  } catch (err) {
    console.error('[cleanup-admin] Cleanup error:', err)
    throw err
  } finally {
    await client.end()
  }
}

// Run directly if executed as script
if (require.main === module) {
  cleanupAdminDashboard().catch((err) => {
    console.error('Cleanup failed:', err)
    process.exit(1)
  })
}
