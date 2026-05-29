import { PrismaClient, UserRole, JobType, JobStatus, ApplicationStatus } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import fs from "fs"
import path from "path"

function getDatabaseUrl(): string {
  const envPath = path.join(__dirname, "..", ".env.local")
  const content = fs.readFileSync(envPath, "utf-8")
  const match = content.match(/DATABASE_URL="(.+?)"/)
  if (!match) throw new Error("DATABASE_URL not found in .env.local")
  return match[1]
}

function createPrismaClient() {
  const dbUrl = getDatabaseUrl()
  const pool = new Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

async function main() {
  const prisma = createPrismaClient()

  console.log("🔬 Testing cleanup script...\n")

  // Step 1: Check current counts
  const before = {
    users: await prisma.user.count(),
    jobs: await prisma.job.count(),
    applications: await prisma.application.count(),
    orgs: await prisma.organizationProfile.count(),
    individuals: await prisma.individualProfile.count(),
  }
  console.log("Current counts (seeded data):")
  console.log(`  Users:         ${before.users}`)
  console.log(`  Organizations: ${before.orgs}`)
  console.log(`  Individuals:   ${before.individuals}`)
  console.log(`  Jobs:          ${before.jobs}`)
  console.log(`  Applications:  ${before.applications}`)

  // Step 2: Insert "manual" data that should NOT be removed
  console.log("\n📝 Inserting manual test data...")

  const manualUser = await prisma.user.create({
    data: {
      email: "manual-org@example.com",
      password: "hashed-password-123",
      name: "Manual Organization",
      role: UserRole.ORGANIZATION,
      isVerified: true,
      organizationProfile: {
        create: {
          domain: "manual-org.com",
          description: "This is manually created data that should survive cleanup.",
        },
      },
    },
    include: { organizationProfile: true },
  })

  const manualIndividual = await prisma.user.create({
    data: {
      email: "manual-user@example.com",
      password: "hashed-password-456",
      name: "Manual User",
      role: UserRole.INDIVIDUAL,
      isVerified: true,
      individualProfile: {
        create: {
          bio: "I am a manually created user.",
          location: "Manual City",
        },
      },
    },
    include: { individualProfile: true },
  })

  const manualJob = await prisma.job.create({
    data: {
      title: "Manual Test Job",
      description: "This job was manually created and should survive cleanup.",
      location: "Remote",
      salaryMin: 50000,
      salaryMax: 80000,
      jobType: JobType.CONTRACT,
      requirements: "Manual requirements.",
      status: JobStatus.ACTIVE,
      organizationId: manualUser.organizationProfile!.id,
    },
  })

  const manualApplication = await prisma.application.create({
    data: {
      jobId: manualJob.id,
      individualId: manualIndividual.individualProfile!.id,
      coverLetter: "This is a manual application.",
      expectedSalary: 75000,
      availability: "Immediate",
      resumeUrl: "https://example.com/manual-resume.pdf",
      status: ApplicationStatus.PENDING,
    },
  })

  console.log(`  Created manual org user: ${manualUser.email}`)
  console.log(`  Created manual individual: ${manualIndividual.email}`)
  console.log(`  Created manual job: ${manualJob.title}`)
  console.log(`  Created manual application: ${manualApplication.id}`)

  const withManual = {
    users: await prisma.user.count(),
    jobs: await prisma.job.count(),
    applications: await prisma.application.count(),
    orgs: await prisma.organizationProfile.count(),
    individuals: await prisma.individualProfile.count(),
  }
  console.log("\nCounts after adding manual data:")
  console.log(`  Users:         ${withManual.users} (+${withManual.users - before.users})`)
  console.log(`  Organizations: ${withManual.orgs} (+${withManual.orgs - before.orgs})`)
  console.log(`  Individuals:   ${withManual.individuals} (+${withManual.individuals - before.individuals})`)
  console.log(`  Jobs:          ${withManual.jobs} (+${withManual.jobs - before.jobs})`)
  console.log(`  Applications:  ${withManual.applications} (+${withManual.applications - before.applications})`)

  // Step 3: Run cleanup
  console.log("\n🧹 Running cleanup script...")
  const { execSync } = require("child_process")
  const cleanupOutput = execSync("pnpm db:cleanup", {
    cwd: process.cwd(),
    encoding: "utf-8",
    stdio: "pipe",
  })
  console.log(cleanupOutput)

  // Step 4: Verify seeded data is gone and manual data remains
  console.log("\n📊 Verification:")

  // Verify seeded users are gone
  const seededEmails = [
    "hr@techcorp.com",
    "careers@startupxyz.com",
    "people@cloudscale.io",
    "alice.chen@email.com",
    "bob.martinez@email.com",
    "carol.wong@email.com",
    "david.kim@email.com",
    "emma.smith@email.com",
  ]
  const seededUsersGone = await prisma.user.findMany({
    where: { email: { in: seededEmails } },
  })
  console.log(`  Seeded users remaining: ${seededUsersGone.length} (expected: 0)`)

  // Verify seeded jobs are gone
  const seededJobTitles = [
    "Senior Full-Stack Engineer",
    "UX Designer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Marketing Manager",
    "Backend Engineer (Go)",
    "Frontend Engineer (React)",
    "Site Reliability Engineer",
    "Growth Marketing Specialist",
    "Staff Software Engineer (Platform)",
  ]
  const seededJobsRemaining = await prisma.job.findMany({
    where: { title: { in: seededJobTitles } },
  })
  console.log(`  Seeded jobs remaining: ${seededJobsRemaining.length} (expected: 0)`)

  // Verify manual records still exist
  const manualUserExists = await prisma.user.findUnique({ where: { email: manualUser.email } })
  const manualJobExists = await prisma.job.findUnique({ where: { id: manualJob.id } })
  const manualAppExists = await prisma.application.findUnique({ where: { id: manualApplication.id } })
  console.log(`  Manual user preserved: ${manualUserExists !== null}`)
  console.log(`  Manual job preserved:  ${manualJobExists !== null}`)
  console.log(`  Manual app preserved:  ${manualAppExists !== null}`)

  const allPassed =
    seededUsersGone.length === 0 &&
    seededJobsRemaining.length === 0 &&
    manualUserExists !== null &&
    manualJobExists !== null &&
    manualAppExists !== null

  if (allPassed) {
    console.log("\n✅ TEST PASSED: All seeded data removed, manual data preserved.")
  } else {
    console.log("\n❌ TEST FAILED: Cleanup did not behave as expected.")
    process.exit(1)
  }

  // Clean up manual test data
  console.log("\n🧹 Cleaning up manual test data...")
  await prisma.application.deleteMany({ where: { id: manualApplication.id } })
  await prisma.job.deleteMany({ where: { id: manualJob.id } })
  await prisma.user.deleteMany({ where: { email: { in: [manualUser.email, manualIndividual.email] } } })
  console.log("  Manual test data removed.")

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error("❌ Test failed:", e)
  process.exit(1)
})
