#!/usr/bin/env node
/**
 * TrustLayer DDoS Cleanup Script
 *
 * Wipes all bot-attack test data from TrustLayer (PostgreSQL + Redis)
 * so the DDoS demo can be rerun cleanly.
 *
 * Usage:
 *   node scripts/ddos-cleanup.js
 *
 * What it deletes:
 *   - PostgreSQL ip_records: all 203.0.113.x entries
 *   - PostgreSQL access_events: events tied to those IP records
 *   - Redis: ip_velocity:203.0.113.* and ip_probe:203.0.113.* keys
 */

/* ── ANSI colours ─────────────────────────────────────────────── */
const C = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
}

function col(code, text) {
  return `${code}${text}${C.reset}`
}

/* ── Config ───────────────────────────────────────────────────── */
const DB_URL = 'postgresql://user:trustlayer123@127.0.0.1:5501/trust-later'
const SUBNET = '203.0.113'

/* ── PostgreSQL cleanup ───────────────────────────────────────── */
async function cleanupPostgres() {
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)

  let ipRecordsDeleted = 0
  let accessEventsDeleted = 0
  let error = false

  try {
    // Check psql is available
    await execAsync('which psql')

    // Delete access_events tied to bot IPs
    try {
      const { stdout: aeOut } = await execAsync(
        `psql ${DB_URL} -t -c "DELETE FROM access_events WHERE \\"ipId\\" IN (SELECT id FROM ip_records WHERE \\"ipAddress\\"::text LIKE '${SUBNET}.%')" 2>&1`
      )
      const match = aeOut.match(/DELETE (\d+)/)
      accessEventsDeleted = match ? parseInt(match[1], 10) : 0
    } catch (err) {
      if (err.message && err.message.includes('relation "access_events" does not exist')) {
        console.log(`  ${col(C.gray, 'access_events table not found, skipping')}`)
      } else {
        throw err
      }
    }

    // Delete ip_records for the test subnet
    try {
      const { stdout: ipOut } = await execAsync(
        `psql ${DB_URL} -t -c "DELETE FROM ip_records WHERE \\"ipAddress\\"::text LIKE '${SUBNET}.%'" 2>&1`
      )
      const match = ipOut.match(/DELETE (\d+)/)
      ipRecordsDeleted = match ? parseInt(match[1], 10) : 0
    } catch (err) {
      if (err.message && err.message.includes('relation "ip_records" does not exist')) {
        console.log(`  ${col(C.gray, 'ip_records table not found, skipping')}`)
      } else {
        throw err
      }
    }
  } catch {
    error = true
  }

  return { ipRecordsDeleted, accessEventsDeleted, error }
}

/* ── Redis cleanup ────────────────────────────────────────────── */
async function cleanupRedis() {
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)

  let velocityKeys = 0
  let probeKeys = 0
  let error = false

  try {
    // Check if redis-cli is available
    await execAsync('which redis-cli')

    // Get velocity keys
    try {
      const { stdout: vOut } = await execAsync(
        `redis-cli KEYS 'ip_velocity:${SUBNET}.*'`
      )
      const vKeys = vOut.trim().split('\n').filter((k) => k.length > 0)
      if (vKeys.length > 0 && vKeys[0] !== '') {
        const keyList = vKeys.join(' ')
        await execAsync(`redis-cli DEL ${keyList}`)
        velocityKeys = vKeys.length
      }
    } catch {
      // No keys found or redis-cli error — non-fatal
    }

    // Get probe keys
    try {
      const { stdout: pOut } = await execAsync(
        `redis-cli KEYS 'ip_probe:${SUBNET}.*'`
      )
      const pKeys = pOut.trim().split('\n').filter((k) => k.length > 0)
      if (pKeys.length > 0 && pKeys[0] !== '') {
        const keyList = pKeys.join(' ')
        await execAsync(`redis-cli DEL ${keyList}`)
        probeKeys = pKeys.length
      }
    } catch {
      // No keys found or redis-cli error — non-fatal
    }
  } catch {
    // redis-cli not installed
    error = true
  }

  return { velocityKeys, probeKeys, error }
}

/* ── Main ────────────────────────────────────────────────────── */
async function main() {
  console.log()
  console.log(col(C.cyan + C.bold, 'TrustLayer DDoS Cleanup'))
  console.log(col(C.gray, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log()

  // PostgreSQL
  console.log(col(C.cyan, 'PostgreSQL — Wiping bot IP records...'))
  const pgResult = await cleanupPostgres()
  if (pgResult.error) {
    console.log(`  ${col(C.yellow, 'Could not connect. Is the database running?')}`)
  } else {
    console.log(`  ${col(C.green, '✓')} Deleted ${pgResult.ipRecordsDeleted} ip_records`)
    if (pgResult.accessEventsDeleted > 0) {
      console.log(`  ${col(C.green, '✓')} Deleted ${pgResult.accessEventsDeleted} access_events`)
    }
  }
  console.log()

  // Redis
  console.log(col(C.cyan, 'Redis — Clearing velocity/probe counters...'))
  const redisResult = await cleanupRedis()
  if (redisResult.error) {
    console.log(`  ${col(C.yellow, 'redis-cli not found. Run these commands manually:')}`)
    console.log(`    redis-cli KEYS 'ip_velocity:${SUBNET}.*' | xargs redis-cli DEL`)
    console.log(`    redis-cli KEYS 'ip_probe:${SUBNET}.*' | xargs redis-cli DEL`)
  } else {
    console.log(`  ${col(C.green, '✓')} Cleared ${redisResult.velocityKeys} ip_velocity keys`)
    console.log(`  ${col(C.green, '✓')} Cleared ${redisResult.probeKeys} ip_probe keys`)
  }
  console.log()

  console.log(col(C.gray, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log(col(C.green + C.bold, 'Done. TrustLayer is clean.'))
  console.log(col(C.gray, 'You can now rerun the DDoS demo.'))
  console.log()
}

main().catch((err) => {
  console.error(col(C.red, `Fatal error: ${err.message}`))
  process.exit(1)
})
