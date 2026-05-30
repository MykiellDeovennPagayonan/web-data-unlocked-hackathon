#!/usr/bin/env node
/**
 * TrustLayer Bot Attack Simulator V2
 *
 * Simulates a realistic multi-worker DDoS botnet attack against demo apps,
 * with a live terminal dashboard showing TrustLayer's 3-phase defense:
 *   PHASE 1 — RECONNAISSANCE  → all requests allowed (200 OK)
 *   PHASE 2 — THROTTLING      → velocity threshold exceeded (429)
 *   PHASE 3 — BLACKLISTED     → IP permanently blocked (403)
 *
 * Usage:
 *   node scripts/ddos-demo.js --target social-media --workers 5 --duration 30
 *   node scripts/ddos-demo.js --target job-board --ip 203.0.113.10 --workers 1 --duration 5
 *   node scripts/ddos-demo.js --target social-media --same-ip --workers 10
 *   node scripts/ddos-demo.js --target social-media --stream
 *   node scripts/ddos-demo.js --target social-media --no-clear
 *
 * Flow for hackathon demo:
 *   1. Attack Social Media with 5 workers → live dashboard shows escalation
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
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgGreen: '\x1b[42m',
  black: '\x1b[30m',
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
  console.log('  --target      social-media | job-board | api-store  (required)')
  console.log('  --ip          Base spoofed IP  (default: random 203.0.113.x)')
  console.log('  --workers     Number of concurrent attack units  (default: 5)')
  console.log('  --duration    Attack duration in seconds  (default: 30)')
  console.log('  --delay       Delay between each worker request in ms  (default: 30)')
  console.log('  --ramp-up     Seconds to stagger worker starts  (default: 2)')
  console.log('  --same-ip     All workers share the same IP  (faster blacklist)')
  console.log('  --stream      Print each request as a log line  (no screen clear)')
  console.log('  --no-clear    Compact one-line stats updating in-place')
  console.log('  --dashboard   Force full-screen live dashboard  (default if TTY)')
  console.log('  --help        Show this help')
  console.log()
  console.log('Examples:')
  console.log('  node scripts/ddos-demo.js --target social-media')
  console.log('  node scripts/ddos-demo.js --target social-media --same-ip --workers 10')
  console.log('  node scripts/ddos-demo.js --target job-board --ip 203.0.113.10 --workers 1 --duration 5')
}

/* ── Config ───────────────────────────────────────────────────── */
const TARGETS = {
  'social-media': 'http://localhost:3001/api/feed',
  'job-board': 'http://localhost:3003/api/jobs',
  'api-store': 'http://localhost:3004/api/endpoints',
}

const TRUSTLAYER_API = 'http://localhost:8090'
const BOT_USER_AGENT = 'Mozilla/5.0 (compatible; BotScraper/1.0; +http://evil.com/bot)'

/* ── Shared state ─────────────────────────────────────────────── */
const globalStats = {
  total: 0,
  ok: 0,
  throttled: 0,
  blocked: 0,
  errors: 0,
  startTime: 0,
}

/** @type {Array<{total:number, ok:number, throttled:number, blocked:number, errors:number, lastStatus:number, ip:string}>} */
let workerStats = []
let abortSignal = { aborted: false }
let displayMode = 'dashboard' // 'dashboard' | 'stream' | 'compact'

/* ── Helpers ──────────────────────────────────────────────────── */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomIp() {
  return `203.0.113.${Math.floor(Math.random() * 254) + 1}`
}

function ipForWorker(baseIp, workerId, sameIp) {
  if (sameIp) return baseIp
  const lastOctet = parseInt(baseIp.split('.')[3], 10)
  return `203.0.113.${((lastOctet + workerId - 1) % 254) + 1}`
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function progressBar(filled, total, width) {
  if (total === 0) return '░'.repeat(width)
  const pct = Math.min(filled / total, 1)
  const filledChars = Math.round(pct * width)
  return '█'.repeat(filledChars) + '░'.repeat(width - filledChars)
}

function miniBar(blocked, total, width) {
  if (total === 0) return '░'.repeat(width)
  const filled = Math.min(Math.round((blocked / total) * width), width)
  return col(C.red, '█'.repeat(filled)) + '░'.repeat(width - filled)
}

function detectPhase() {
  const allHaveData = workerStats.every((w) => w.total > 0)
  if (!allHaveData) return { name: 'PHASE 1 — RECONNAISSANCE', color: C.green, bg: C.bgGreen }

  const allFullyBlocked = workerStats.every(
    (w) => w.blocked > 0 && w.ok === 0 && w.throttled === 0 && w.total > 5
  )
  if (allFullyBlocked) {
    return { name: 'PHASE 3 — BLACKLISTED', color: C.red, bg: C.bgRed }
  }

  const anyThrottled = workerStats.some((w) => w.throttled > 0)
  const anyBlocked = workerStats.some((w) => w.blocked > 0)
  if (anyThrottled || anyBlocked) {
    return { name: 'PHASE 2 — THROTTLING', color: C.yellow, bg: C.bgYellow }
  }

  return { name: 'PHASE 1 — RECONNAISSANCE', color: C.green, bg: C.bgGreen }
}

/* ── Stream log ──────────────────────────────────────────────── */
function logStream(elapsedMs, workerId, ip, status, detail) {
  const ts = (elapsedMs / 1000).toFixed(1).padStart(5, '0')
  let statusCol
  if (status === 200) statusCol = col(C.green, '200 OK       ')
  else if (status === 429) statusCol = col(C.yellow, '429 THROTTLED')
  else if (status === 403) statusCol = col(C.red, '403 BLOCKED  ')
  else statusCol = col(C.gray, `${status} ??       `)

  console.log(
    `${col(C.gray, `[${ts}s]`)} Worker #${(workerId + 1).toString().padStart(2, '0')}  ${ip}  → ${statusCol}  ${col(C.gray, detail || '')}`
  )
}

/* ── Compact line update ──────────────────────────────────────── */
function renderCompactLine(durationMs) {
  const elapsed = Date.now() - globalStats.startTime
  const elapsedSec = Math.min(elapsed / 1000, durationMs / 1000)
  const phase = detectPhase()
  const rps = elapsed > 500 ? (globalStats.total / (elapsed / 1000)).toFixed(1) : '0.0'

  const line =
    `${formatTime(elapsedSec)}  ` +
    `req:${globalStats.total.toString().padStart(4)}  ` +
    `${col(C.green, `200:${globalStats.ok}`)}  ` +
    `${col(C.yellow, `429:${globalStats.throttled}`)}  ` +
    `${col(C.red, `403:${globalStats.blocked}`)}  ` +
    `|  ${col(C.cyan, `RPS:${rps}`)}  ` +
    `|  ${phase.color}${phase.name}${C.reset}`

  process.stdout.write('\r' + line)
}

/* ── Worker ───────────────────────────────────────────────────── */
async function runWorker(id, ip, targetKey, baseUrl, durationMs, rampUpMs, delayMs) {
  // Staggered start
  if (rampUpMs > 0) {
    await sleep(rampUpMs * id)
  }

  const stats = workerStats[id]
  const isApiStore = targetKey === 'api-store'

  while (!abortSignal.aborted && Date.now() - globalStats.startTime < durationMs) {
    const pageNum = (stats.total % 3) + 1
    const url = isApiStore ? baseUrl : `${baseUrl}?page=${pageNum}&limit=10`

    let status = 0
    let detail = ''

    try {
      const res = await fetch(url, {
        headers: {
          'x-forwarded-for': ip,
          'user-agent': BOT_USER_AGENT,
        },
      })

      status = res.status
      stats.total++
      globalStats.total++

      if (res.status === 200) {
        stats.ok++
        globalStats.ok++
        stats.lastStatus = 200
        try {
          const body = await res.json()
          if (body.posts && Array.isArray(body.posts)) detail = `${body.posts.length} posts`
          else if (Array.isArray(body)) detail = `${body.length} items`
        } catch {
          detail = 'data'
        }
      } else if (res.status === 429) {
        stats.throttled++
        globalStats.throttled++
        stats.lastStatus = 429
        try { const body = await res.json(); detail = body.error || body.message || '' } catch {}
      } else if (res.status === 403) {
        stats.blocked++
        globalStats.blocked++
        stats.lastStatus = 403
        try { const body = await res.json(); detail = body.error || body.message || '' } catch {}
      } else {
        stats.errors++
        globalStats.errors++
        stats.lastStatus = res.status
      }
    } catch (err) {
      stats.total++
      globalStats.total++
      stats.errors++
      globalStats.errors++
      stats.lastStatus = 0
      detail = err.message || 'network error'
    }

    if (displayMode === 'stream') {
      logStream(Date.now() - globalStats.startTime, id, ip, status, detail)
    }

    if (delayMs > 0) {
      await sleep(delayMs)
    }
  }
}

/* ── Dashboard renderer ─────────────────────────────────────── */
function renderDashboard(targetUrl, workerCount, durationMs) {
  const elapsed = Date.now() - globalStats.startTime
  const elapsedSec = Math.min(elapsed / 1000, durationMs / 1000)
  const totalSec = durationMs / 1000
  const pctDone = Math.min((elapsedSec / totalSec) * 100, 100).toFixed(0)
  const rps = elapsed > 500 ? (globalStats.total / (elapsed / 1000)).toFixed(1) : '0.0'

  const phase = detectPhase()

  let out = ''

  // Header
  out += col(C.cyan + C.bold, '╔════════════════════════════════════════════════════════════════╗') + '\n'
  out += col(C.cyan + C.bold, '║        TrustLayer DDoS Attack Simulator — Live Dashboard       ║') + '\n'
  out += col(C.cyan + C.bold, '╠════════════════════════════════════════════════════════════════╣') + '\n'

  // Target info
  const activeWorkers = workerStats.filter((w) => w.total > 0).length
  out += `${col(C.gray, '║ Target:')}   ${targetUrl.padEnd(52)}${col(C.gray, '║')}\n`
  out += `${col(C.gray, '║ Duration:')} ${formatTime(elapsedSec)} / ${formatTime(totalSec)} ${col(C.gray, '|')} Workers: ${activeWorkers}/${workerCount} active${' '.repeat(13)}${col(C.gray, '║')}\n`
  out += col(C.cyan + C.bold, '╠════════════════════════════════════════════════════════════════╣') + '\n'

  // Phase banner
  const bannerText = `  ${phase.name}  `
  const bannerPad = Math.max(0, 64 - bannerText.length)
  const bannerLeft = Math.floor(bannerPad / 2)
  const bannerRight = bannerPad - bannerLeft
  out += `${phase.bg}${C.black}${C.bold}${' '.repeat(bannerLeft)}${phase.name}${' '.repeat(bannerRight)}${C.reset}\n`
  out += '\n'

  // Global metrics
  const total = globalStats.total
  const okPct = total > 0 ? Math.round((globalStats.ok / total) * 100) : 0
  const throttlePct = total > 0 ? Math.round((globalStats.throttled / total) * 100) : 0
  const blockPct = total > 0 ? Math.round((globalStats.blocked / total) * 100) : 0
  const errPct = total > 0 ? Math.round((globalStats.errors / total) * 100) : 0

  out += col(C.cyan + C.bold, '                    LIVE ATTACK METRICS') + '\n'
  out += '\n'
  out += `  ${col(C.cyan, 'Total Requests:')}    ${col(C.bold, total.toString().padStart(5))}   ${progressBar(total, Math.max(total, 500), 30)}  ${pctDone}%\n`
  out += `  ${col(C.green, '200 OK:')}             ${col(C.bold, globalStats.ok.toString().padStart(5))}   ${col(C.green, progressBar(globalStats.ok, total, 30))}  ${okPct}%\n`
  out += `  ${col(C.yellow, '429 THROTTLED:')}      ${col(C.bold, globalStats.throttled.toString().padStart(5))}   ${col(C.yellow, progressBar(globalStats.throttled, total, 30))}  ${throttlePct}%\n`
  out += `  ${col(C.red, '403 BLOCKED:')}        ${col(C.bold, globalStats.blocked.toString().padStart(5))}   ${col(C.red, progressBar(globalStats.blocked, total, 30))}  ${blockPct}%\n`
  if (globalStats.errors > 0) {
    out += `  ${col(C.gray, 'ERRORS:')}             ${col(C.bold, globalStats.errors.toString().padStart(5))}   ${col(C.gray, progressBar(globalStats.errors, total, 30))}  ${errPct}%\n`
  }
  out += '\n'
  out += `  ${col(C.cyan, 'RPS (current):')}      ${col(C.bold, rps)} req/s${' '.repeat(37)}\n`
  out += '\n'

  // Per-worker table
  out += col(C.cyan + C.bold, '╠════════════════════════════════════════════════════════════════╣') + '\n'
  out += `${col(C.cyan + C.bold, '║')}  ${col(C.gray, 'Worker')}  ${col(C.gray, 'IP Address')}          ${col(C.gray, 'Progress')}           ${col(C.gray, 'Reqs')}  ${col(C.gray, 'Status')}${' '.repeat(10)}${col(C.cyan + C.bold, '║')}\n`
  out += col(C.cyan + C.bold, '╠════════════════════════════════════════════════════════════════╣') + '\n'

  for (let i = 0; i < workerStats.length; i++) {
    const w = workerStats[i]
    const wid = `#${(i + 1).toString().padStart(2, '0')}`
    const wip = w.ip.padEnd(18)
    const wbar = miniBar(w.blocked, w.total, 18)
    const wreq = w.total.toString().padStart(4)

    let wstatus
    if (w.total === 0) wstatus = col(C.gray, 'WAITING')
    else if (w.blocked > 0 && w.ok === 0 && w.throttled === 0) wstatus = col(C.red, 'BLOCKED')
    else if (w.throttled > 0 && w.ok === 0) wstatus = col(C.yellow, 'THROTTLED')
    else if (w.blocked > 0) wstatus = col(C.yellow, 'MIXED')
    else wstatus = col(C.green, 'OK')

    out += `${col(C.cyan + C.bold, '║')}  ${wid}  ${wip}  ${wbar}  ${wreq}  ${wstatus}${' '.repeat(Math.max(0, 16 - wstatus.replace(/\x1b\[[0-9;]*m/g, '').length))}${col(C.cyan + C.bold, '║')}\n`
  }

  out += col(C.cyan + C.bold, '╚════════════════════════════════════════════════════════════════╝') + '\n'

  // Clear screen and render
  process.stdout.write('\x1b[2J\x1b[H' + out)
}

/* ── Final summary ────────────────────────────────────────────── */
async function printSummary(botIps, targetKey, baseUrl) {
  const elapsed = (Date.now() - globalStats.startTime) / 1000

  console.log('\n')
  console.log(col(C.gray, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'))
  console.log()
  console.log(col(C.cyan + C.bold, 'REPORT'))
  console.log()
  console.log(`  ${col(C.gray, 'Duration:')}     ${elapsed.toFixed(1)}s`)
  console.log(`  ${col(C.gray, 'Total reqs:')}   ${globalStats.total}`)
  console.log(`  ${col(C.green, '200 OK:')}       ${globalStats.ok}`)
  console.log(`  ${col(C.yellow, '429 THROTTLE:')}  ${globalStats.throttled}`)
  console.log(`  ${col(C.red, '403 BLOCK:')}     ${globalStats.blocked}`)
  if (globalStats.errors > 0) console.log(`  ${col(C.gray, 'Errors:')}       ${globalStats.errors}`)
  console.log()
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

  const baseIp = args.ip || randomIp()
  const workerCount = parseInt(args.workers || '5', 10)
  const durationSec = parseInt(args.duration || '30', 10)
  const delayMs = parseInt(args.delay || '30', 10)
  const rampUpSec = parseInt(args['ramp-up'] || '2', 10)
  const sameIp = args['same-ip'] === 'true'
  const baseUrl = TARGETS[targetKey]
  const durationMs = durationSec * 1000
  const rampUpMs = rampUpSec * 1000

  // Generate worker IPs
  const botIps = []
  for (let i = 0; i < workerCount; i++) {
    botIps.push(ipForWorker(baseIp, i, sameIp))
  }

  // Reset shared state
  globalStats.total = 0
  globalStats.ok = 0
  globalStats.throttled = 0
  globalStats.blocked = 0
  globalStats.errors = 0
  globalStats.startTime = Date.now()
  abortSignal.aborted = false

  workerStats = botIps.map((ip) => ({
    ip,
    total: 0,
    ok: 0,
    throttled: 0,
    blocked: 0,
    errors: 0,
    lastStatus: 0,
  }))

  // Determine display mode
  const isTty = process.stdout.isTTY
  if (args.stream) displayMode = 'stream'
  else if (args['no-clear']) displayMode = 'compact'
  else if (args.dashboard) displayMode = 'dashboard'
  else displayMode = isTty ? 'dashboard' : 'compact'

  if (displayMode === 'stream') {
    console.log(col(C.cyan + C.bold, '╔════════════════════════════════════════╗'))
    console.log(col(C.cyan + C.bold, '║  TrustLayer DDoS — Stream Mode         ║'))
    console.log(col(C.cyan + C.bold, '╚════════════════════════════════════════╝'))
    console.log(`${col(C.gray, 'Target:')} ${baseUrl}  |  ${col(C.gray, 'Workers:')} ${workerCount}  |  ${col(C.gray, 'Duration:')} ${durationSec}s`)
    console.log()
  } else if (displayMode === 'compact') {
    console.log(col(C.cyan + C.bold, 'TrustLayer DDoS — Compact Mode'))
    console.log(`${col(C.gray, 'Target:')} ${baseUrl}  |  Workers: ${workerCount}  |  Duration: ${durationSec}s`)
    console.log(col(C.gray, '────────────────────────────────────────'))
  }

  // Start renderer (dashboard or compact)
  let renderInterval = null
  if (displayMode === 'dashboard') {
    renderInterval = setInterval(() => {
      renderDashboard(baseUrl, workerCount, durationMs)
    }, 200)
  } else if (displayMode === 'compact') {
    renderInterval = setInterval(() => {
      renderCompactLine(durationMs)
    }, 200)
  }

  // Spawn workers
  const workerPromises = botIps.map((ip, id) =>
    runWorker(id, ip, targetKey, baseUrl, durationMs, rampUpMs, delayMs)
  )

  // Wait for all workers to finish
  await Promise.all(workerPromises)

  // Stop rendering
  if (renderInterval) clearInterval(renderInterval)
  abortSignal.aborted = true

  // Final render
  if (displayMode === 'dashboard') {
    renderDashboard(baseUrl, workerCount, durationMs)
  } else if (displayMode === 'compact') {
    renderCompactLine(durationMs)
    console.log() // newline after compact line
  }

  await printSummary(botIps, targetKey, baseUrl)
}

main().catch((err) => {
  console.error(col(C.red, `Fatal error: ${err.message}`))
  process.exit(1)
})
