#!/usr/bin/env node
/**
 * TrustLayer Bot Attack Simulator
 *
 * A terminal CLI script that fires rapid HTTP requests to demo app endpoints
 * with a spoofed bot IP, demonstrating TrustLayer's velocity-based
 * throttling and cross-platform blacklisting in real time.
 *
 * Usage:
 *   node scripts/ddos-demo.js --target social-media --requests 60 --delay 50
 *   node scripts/ddos-demo.js --target job-board --ip 203.0.113.45 --requests 5
 *   node scripts/ddos-demo.js --target api-store --requests 40 --delay 100
 *
 * Flow for hackathon demo:
 *   1. Attack Social Media → watch 200 → 429 → 403 escalation
 *   2. Manually pivot to Job Board with same IP → instant 403
 *   3. curl from normal 127.0.0.1 → still 200 (unaffected)
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

/* ── CLI arg parsing ──────────────────────────────────────────── */
function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        args[key] = next
        i++
      } else {
        args[key] = 'true'
      }
    }
  }
  return args
}

function showHelp() {
  console.log(col(C.cyan + C.bold, 'TrustLayer Bot Attack Simulator'))
  console.log()
  console.log('Usage: node scripts/ddos-demo.js [options]')
  console.log()
  console.log('Options:')
  console.log('  --target     social-media | job-board | api-store  (required)')
  console.log('  --ip         Spoofed bot IP  (default: random 203.0.113.x)')
  console.log('  --requests   Number of requests  (default: 60)')
  console.log('  --delay      Delay between requests in ms  (default: 50)')
  console.log('  --pages      Unique pages to cycle  (default: 3)')
  console.log('  --help       Show this help')
  console.log()
  console.log('Examples:')
  console.log('  node scripts/ddos-demo.js --target social-media')
  console.log('  node scripts/ddos-demo.js --target job-board --ip 203.0.113.45 --requests 5')
}

/* ── Config ───────────────────────────────────────────────────── */
const TARGETS = {
  'social-media': 'http://localhost:3001/api/feed',
  'job-board': 'http://localhost:3003/api/jobs',
  'api-store': 'http://localhost:3004/api/endpoints',
}

const TRUSTLAYER_API = 'http://localhost:8090'

const BOT_USER_AGENT =
  'Mozilla/5.0 (compatible; BotScraper/1.0; +http://evil.com/bot)'

/* ── Helpers ──────────────────────────────────────────────────── */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomIp() {
  return `203.0.113.${Math.floor(Math.random() * 254) + 1}`
}

function statusIcon(status) {
  if (status === 200) return col(C.green, '✅')
  if (status === 429) return col(C.yellow, '⚠️ ')
  if (status === 403) return col(C.red, '🚫')
  return col(C.gray, '?')
}

function statusLabel(status) {
  if (status === 200) return col(C.green, '200 OK       ')
  if (status === 429) return col(C.yellow, '429 THROTTLED')
  if (status === 403) return col(C.red, '403 BLOCKED  ')
  return col(C.gray, `${status} UNKNOWN`)
}

/* ── Main ────────────────────────────────────────────────────── */
async function main() {
  const args = parseArgs(process.argv)

  if (args.help || !args.target) {
    showHelp()
    process.exit(args.help ? 0 : 1)
  }

  const targetKey = args.target
  if (!TARGETS[targetKey]) {
    console.error(col(C.red, `Unknown target: ${targetKey}`))
    console.error(`Valid targets: ${Object.keys(TARGETS).join(', ')}`)
    process.exit(1)
  }

  const botIp = args.ip || randomIp()
  const totalRequests = parseInt(args.requests || '60', 10)
  const delayMs = parseInt(args.delay || '50', 10)
  const pages = parseInt(args.pages || '3', 10)
  const baseUrl = TARGETS[targetKey]

  /* ── Header ─────────────────────────────────────────────── */
  console.log(col(C.cyan + C.bold, '╔════════════════════════════════════════╗'))
  console.log(col(C.cyan + C.bold, '║     TrustLayer Bot Attack Simulator    ║'))
  console.log(col(C.cyan + C.bold, '╚════════════════════════════════════════╝'))
  console.log()
  console.log(`${col(C.gray, 'Target:')}   ${baseUrl}`)
  console.log(`${col(C.gray, 'Bot IP:')}   ${botIp}`)
  console.log(
    `${col(C.gray, 'Requests:')} ${totalRequests} ${col(C.gray, '|')} Delay: ${delayMs}ms ${col(C.gray, '|')} Pages: ${pages}`
  )
  console.log()

  /* ── Attack loop ────────────────────────────────────────── */
  const statuses = []
  const preview = []

  for (let i = 0; i < totalRequests; i++) {
    const pageNum = (i % pages) + 1
    const url =
      targetKey === 'api-store'
        ? baseUrl
        : `${baseUrl}?page=${pageNum}&limit=10`

    try {
      const res = await fetch(url, {
        headers: {
          'x-forwarded-for': botIp,
          'user-agent': BOT_USER_AGENT,
        },
      })

      statuses.push(res.status)

      let snippet = ''
      if (res.ok) {
        try {
          const body = await res.json()
          if (Array.isArray(body)) {
            snippet = `${body.length} items`
          } else if (body.posts && Array.isArray(body.posts)) {
            snippet = `${body.posts.length} posts`
          } else {
            snippet = 'data'
          }
        } catch {
          snippet = 'data'
        }
      } else {
        try {
          const body = await res.json()
          snippet = body.error || body.message || 'blocked'
        } catch {
          snippet = 'blocked'
        }
      }
      preview.push(snippet)

      const idx = (i + 1).toString().padStart(2, '0')
      console.log(
        `[${idx}]  ${statusLabel(res.status)} ${statusIcon(res.status)}  ${col(C.gray, snippet)}`
      )
    } catch (err) {
      statuses.push(0)
      preview.push('network error')
      const idx = (i + 1).toString().padStart(2, '0')
      console.log(
        `[${idx}]  ${col(C.red, 'ERR NETWORK  ')} ${col(C.red, '❌')}  ${col(C.gray, String(err.message || err))}`
      )
    }

    if (i < totalRequests - 1) {
      await sleep(delayMs)
    }
  }

  /* ── Results summary ──────────────────────────────────────── */
  const allowed = statuses.filter((s) => s >= 200 && s < 300).length
  const throttled = statuses.filter((s) => s === 429).length
  const blocked = statuses.filter((s) => s === 403).length
  const errors = statuses.filter((s) => s === 0 || (s >= 400 && s !== 403 && s !== 429)).length

  console.log()
  console.log(col(C.gray, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log()
  console.log(col(C.cyan + C.bold, 'Results'))
  console.log(`  ${col(C.green, 'Allowed:')}    ${allowed}`)
  console.log(`  ${col(C.yellow, 'Throttled:')}  ${throttled}`)
  console.log(`  ${col(C.red, 'Blocked:')}    ${blocked}`)
  if (errors > 0) console.log(`  ${col(C.red, 'Errors:')}     ${errors}`)
  console.log()

  /* ── TrustLayer IP Intelligence ─────────────────────────── */
  console.log(col(C.cyan + C.bold, 'TrustLayer IP Intelligence'))
  console.log(`  ${col(C.gray, 'IP:')}          ${botIp}`)

  try {
    const ipRes = await fetch(`${TRUSTLAYER_API}/admin/ip/${botIp}`, {
      headers: { 'x-api-key': 'dev-api-key' },
    })

    if (ipRes.ok) {
      const ipRecord = await ipRes.json()

      const isBlacklisted = ipRecord.isBlacklisted === true
      const riskScore = ipRecord.riskScore ?? 'N/A'
      const source = ipRecord.blacklistSource || 'N/A'

      console.log(
        `  ${col(C.gray, 'Blacklisted:')} ${isBlacklisted ? col(C.red, '✅ YES') : col(C.green, '❌ NO')}`
      )
      console.log(`  ${col(C.gray, 'Risk Score:')}  ${isBlacklisted ? col(C.red, String(riskScore)) : col(C.green, String(riskScore))}`)
      console.log(`  ${col(C.gray, 'Source:')}      ${source}`)

      if (isBlacklisted) {
        console.log()
        console.log(col(C.yellow, '  🛡️  This IP has been blacklisted by TrustLayer.'))
        console.log(col(C.gray, '     Any request from this IP to any platform will be blocked.'))
      }
    } else {
      console.log(`  ${col(C.gray, 'Status:')}      ${col(C.yellow, 'No record found (IP may not be in DB yet)')}`)
    }
  } catch {
    console.log(`  ${col(C.yellow, 'Warning:')}     Could not reach TrustLayer API at ${TRUSTLAYER_API}`)
  }

  /* ── Cross-platform hint ────────────────────────────────── */
  if (blocked > 0) {
    console.log()
    console.log(col(C.gray, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
    console.log()
    console.log(col(C.cyan, '💡 Try this next:'))
    console.log(
      col(C.gray, `   node scripts/ddos-demo.js --target job-board --ip ${botIp} --requests 5`)
    )
    console.log(col(C.gray, '   → The same IP should be instantly blocked on Job Board.'))
    console.log()
    console.log(col(C.gray, '   Or verify a normal user is unaffected:'))
    console.log(col(C.gray, `   curl ${baseUrl}`))
    console.log(col(C.gray, '   → Should return 200 (your real 127.0.0.1 is not blacklisted).'))
  }

  console.log()
}

main().catch((err) => {
  console.error(col(C.red, `Fatal error: ${err.message}`))
  process.exit(1)
})
