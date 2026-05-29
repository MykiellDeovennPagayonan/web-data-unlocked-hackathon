import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import fs from "fs"
import path from "path"

const MANIFEST_PATH = path.join(__dirname, ".seed-manifest.json")

function getDatabaseUrl(): string {
  const envPath = path.join(__dirname, "..", ".env.local")
  const content = fs.readFileSync(envPath, "utf-8")
  const match = content.match(/DATABASE_URL="(.+?)"/)
  if (!match) throw new Error("DATABASE_URL not found in .env.local")
  return match[1]
}

// Known seeded emails as fallback if manifest is missing
const SEEDED_ORG_EMAILS = [
  "hr@techcorp.com",
  "careers@startupxyz.com",
  "people@cloudscale.io",
]
const SEEDED_INDIVIDUAL_EMAILS = [
  "alice.chen@email.com",
  "bob.martinez@email.com",
  "carol.wong@email.com",
  "david.kim@email.com",
  "emma.smith@email.com",
]

function createPrismaClient() {
  const dbUrl = getDatabaseUrl()
  const pool = new Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

interface SeedManifest {
  seededAt: string
  organizationUserIds: string[]
  individualUserIds: string[]
  jobIds: string[]
  applicationIds: string[]
}

async function loadManifest(): Promise<SeedManifest | null> {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) return null
    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8")
    return JSON.parse(raw) as SeedManifest
  } catch {
    return null
  }
}

async function resolveIdsFromManifest(prisma: PrismaClient): Promise<{
  applicationIds: string[]
  jobIds: string[]
  userIds: string[]
}> {
  const manifest = await loadManifest()

  if (manifest) {
    console.log("📄 Found seed manifest, using recorded IDs.")
    const allUserIds = [
      ...manifest.organizationUserIds,
      ...manifest.individualUserIds,
    ]
    return {
      applicationIds: manifest.applicationIds,
      jobIds: manifest.jobIds,
      userIds: allUserIds,
    }
  }

  console.log("⚠️  No manifest found. Falling back to known email list.")
  const allEmails = [...SEEDED_ORG_EMAILS, ...SEEDED_INDIVIDUAL_EMAILS]
  const users = await prisma.user.findMany({
    where: { email: { in: allEmails } },
    select: { id: true },
  })

  // For jobs and applications, we need to trace from users
  const orgProfiles = await prisma.organizationProfile.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
    select: { id: true },
  })
  const orgProfileIds = orgProfiles.map((p) => p.id)

  const jobs = await prisma.job.findMany({
    where: { organizationId: { in: orgProfileIds } },
    select: { id: true },
  })

  const individualProfiles = await prisma.individualProfile.findMany({
    where: { userId: { in: users.map((u) => u.id) } },
    select: { id: true },
  })
  const individualProfileIds = individualProfiles.map((p) => p.id)

  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { jobId: { in: jobs.map((j) => j.id) } },
        { individualId: { in: individualProfileIds } },
      ],
    },
    select: { id: true },
  })

  return {
    applicationIds: applications.map((a) => a.id),
    jobIds: jobs.map((j) => j.id),
    userIds: users.map((u) => u.id),
  }
}

async function main() {
  const prisma = createPrismaClient()

  console.log("🧹 Starting cleanup of seeded data...\n")

  // Pre-cleanup counts
  const before = {
    users: await prisma.user.count(),
    jobs: await prisma.job.count(),
    applications: await prisma.application.count(),
    organizations: await prisma.organizationProfile.count(),
    individuals: await prisma.individualProfile.count(),
  }
  console.log("Counts before cleanup:")
  console.log(`  Users:         ${before.users}`)
  console.log(`  Organizations: ${before.organizations}`)
  console.log(`  Individuals:   ${before.individuals}`)
  console.log(`  Jobs:          ${before.jobs}`)
  console.log(`  Applications:  ${before.applications}`)

  const ids = await resolveIdsFromManifest(prisma)

  if (ids.userIds.length === 0) {
    console.log("\n✅ No seeded data found. Nothing to clean up.")
    await prisma.$disconnect()
    return
  }

  console.log(`\n  Resolved IDs:`)
  console.log(`    ${ids.userIds.length} users to delete`)
  console.log(`    ${ids.jobIds.length} jobs to delete`)
  console.log(`    ${ids.applicationIds.length} applications to delete`)

  // Step 1: Delete applications (safe to delete even if some are already gone)
  if (ids.applicationIds.length > 0) {
    const result = await prisma.application.deleteMany({
      where: { id: { in: ids.applicationIds } },
    })
    console.log(`\n  🗑️  Deleted ${result.count} applications`)
  }

  // Step 2: Delete jobs
  if (ids.jobIds.length > 0) {
    const result = await prisma.job.deleteMany({
      where: { id: { in: ids.jobIds } },
    })
    console.log(`  🗑️  Deleted ${result.count} jobs`)
  }

  // Step 3: Delete users (cascades to profiles, accounts, sessions)
  if (ids.userIds.length > 0) {
    const result = await prisma.user.deleteMany({
      where: { id: { in: ids.userIds } },
    })
    console.log(`  🗑️  Deleted ${result.count} users (profiles/accounts/sessions cascaded)`)
  }

  // Post-cleanup counts
  const after = {
    users: await prisma.user.count(),
    jobs: await prisma.job.count(),
    applications: await prisma.application.count(),
    organizations: await prisma.organizationProfile.count(),
    individuals: await prisma.individualProfile.count(),
  }

  console.log("\nCounts after cleanup:")
  console.log(`  Users:         ${after.users}`)
  console.log(`  Organizations: ${after.organizations}`)
  console.log(`  Individuals:   ${after.individuals}`)
  console.log(`  Jobs:          ${after.jobs}`)
  console.log(`  Applications:  ${after.applications}`)

  const removed = {
    users: before.users - after.users,
    jobs: before.jobs - after.jobs,
    applications: before.applications - after.applications,
    organizations: before.organizations - after.organizations,
    individuals: before.individuals - after.individuals,
  }

  console.log("\n📊 Removed:")
  console.log(`  Users:         ${removed.users}`)
  console.log(`  Organizations: ${removed.organizations}`)
  console.log(`  Individuals:   ${removed.individuals}`)
  console.log(`  Jobs:          ${removed.jobs}`)
  console.log(`  Applications:  ${removed.applications}`)

  // Clean up manifest file
  if (fs.existsSync(MANIFEST_PATH)) {
    fs.unlinkSync(MANIFEST_PATH)
    console.log(`\n📝 Removed manifest file`)
  }

  console.log("\n✅ Cleanup completed. Manually added data has been preserved.")

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error("❌ Cleanup failed:", e)
  process.exit(1)
})
