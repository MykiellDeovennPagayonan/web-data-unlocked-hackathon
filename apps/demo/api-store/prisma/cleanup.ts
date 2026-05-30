import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const SEEDED_ORG_EMAILS = [
  "apis@openai-solutions.demo",
  "dev@weatherdata.demo",
  "platform@financehub.demo",
]

const SEEDED_INDIVIDUAL_EMAILS = [
  "alice.chen@email.com",
  "bob.martinez@email.com",
  "carol.wong@email.com",
  "david.kim@email.com",
  "emma.smith@email.com",
]

const ALL_SEEDED_EMAILS = [...SEEDED_ORG_EMAILS, ...SEEDED_INDIVIDUAL_EMAILS]

async function main() {
  const prisma = createPrismaClient()

  console.log("🧹 Starting API Store cleanup...")
  console.log("   Target: remove only seeded demo data")
  console.log("   Preserving: any manually created users, endpoints, logs, etc.")
  console.log()

  // --- 1. Identify seeded users ---
  const seededUsers = await prisma.user.findMany({
    where: { email: { in: ALL_SEEDED_EMAILS } },
    include: {
      organizationProfile: { include: { endpoints: { select: { id: true, name: true } } } },
      individualProfile: true,
      apiKey: true,
    },
  })

  if (seededUsers.length === 0) {
    console.log("✅ No seeded users found. Nothing to clean up.")
    await prisma.$disconnect()
    return
  }

  console.log(`Found ${seededUsers.length} seeded user(s):`)
  for (const u of seededUsers) {
    const extra = u.organizationProfile
      ? ` (org, ${u.organizationProfile.endpoints.length} endpoint(s))`
      : u.individualProfile
        ? " (individual)"
        : ""
    console.log(`   - ${u.email}${extra}`)
  }
  console.log()

  // --- 2. Warn about manual usage logs tied to seeded endpoints ---
  const seededOrgProfileIds = seededUsers
    .map((u) => u.organizationProfile?.id)
    .filter((id): id is string => Boolean(id))

  const seededEndpointIds = seededUsers
    .flatMap((u) => u.organizationProfile?.endpoints ?? [])
    .map((ep) => ep.id)

  if (seededEndpointIds.length > 0) {
    const manualUsageLogsOnSeededEndpoints = await prisma.apiUsageLog.findMany({
      where: {
        endpointId: { in: seededEndpointIds },
        userId: { notIn: seededUsers.map((u) => u.id) },
      },
      select: { id: true, userId: true, endpointId: true },
    })

    if (manualUsageLogsOnSeededEndpoints.length > 0) {
      console.log(`⚠️  Warning: ${manualUsageLogsOnSeededEndpoints.length} usage log(s) from non-seeded users reference seeded endpoints.`)
      console.log("   These usage logs will also be removed because the seeded endpoints they reference will be deleted.")
      console.log()
    }
  }

  // --- 3. Delete seeded users (cascades profiles, keys, free trials, credit transactions, and user-specific usage logs) ---
  console.log("Deleting seeded users and their cascaded data...")
  const deleteResult = await prisma.user.deleteMany({
    where: { email: { in: ALL_SEEDED_EMAILS } },
  })
  console.log(`   Deleted ${deleteResult.count} user(s)`)

  // --- 4. Check for orphaned endpoints (should be none due to cascade, but safety check) ---
  if (seededOrgProfileIds.length > 0) {
    const orphanedEndpoints = await prisma.apiEndpoint.findMany({
      where: { orgProfileId: { in: seededOrgProfileIds } },
      select: { id: true, name: true },
    })
    if (orphanedEndpoints.length > 0) {
      console.log(`   Cleaning up ${orphanedEndpoints.length} orphaned endpoint(s)...`)
      await prisma.apiEndpoint.deleteMany({
        where: { id: { in: orphanedEndpoints.map((ep) => ep.id) } },
      })
    }
  }

  // --- 5. Verify cleanup ---
  console.log()
  console.log("🔍 Verifying cleanup...")

  const remainingSeededUsers = await prisma.user.findMany({
    where: { email: { in: ALL_SEEDED_EMAILS } },
  })

  const remainingSeededEndpoints = seededEndpointIds.length > 0
    ? await prisma.apiEndpoint.findMany({ where: { id: { in: seededEndpointIds } } })
    : []

  const checks = [
    { label: "Seeded users remaining", count: remainingSeededUsers.length, expected: 0 },
    { label: "Seeded endpoints remaining", count: remainingSeededEndpoints.length, expected: 0 },
  ]

  let allClean = true
  for (const check of checks) {
    const ok = check.count === check.expected
    allClean = allClean && ok
    const icon = ok ? "✅" : "❌"
    console.log(`   ${icon} ${check.label}: ${check.count} (expected ${check.expected})`)
  }

  // --- 6. Report preserved manual data ---
  console.log()
  console.log("📊 Manual data preservation check:")
  const manualUserCount = await prisma.user.count({ where: { email: { notIn: ALL_SEEDED_EMAILS } } })
  const manualEndpointCount = seededEndpointIds.length > 0
    ? await prisma.apiEndpoint.count({ where: { id: { notIn: seededEndpointIds } } })
    : await prisma.apiEndpoint.count()
  const seededUserIds = seededUsers.map((u) => u.id)
  const manualUsageLogCount = seededUserIds.length > 0
    ? await prisma.apiUsageLog.count({ where: { userId: { notIn: seededUserIds } } })
    : await prisma.apiUsageLog.count()
  const manualTransactionCount = seededUserIds.length > 0
    ? await prisma.creditTransaction.count({ where: { userId: { notIn: seededUserIds } } })
    : await prisma.creditTransaction.count()

  console.log(`   Users preserved: ${manualUserCount}`)
  console.log(`   Endpoints preserved: ${manualEndpointCount}`)
  console.log(`   Usage logs preserved: ${manualUsageLogCount}`)
  console.log(`   Credit transactions preserved: ${manualTransactionCount}`)

  console.log()
  if (allClean) {
    console.log("🎉 Cleanup completed successfully!")
  } else {
    console.log("⚠️  Cleanup completed with warnings. Some seeded data may remain.")
    process.exitCode = 1
  }

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error("❌ Cleanup failed:", e)
  process.exit(1)
})
