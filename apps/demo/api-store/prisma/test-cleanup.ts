import { PrismaClient, UserRole, CreditTransactionType } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
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

async function runCleanupScript() {
  const { execSync } = require("child_process")
  execSync("npx tsx prisma/cleanup.ts", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: "inherit",
  })
}

async function main() {
  const prisma = createPrismaClient()
  const hashedPassword = await hashPassword("ManualTest123!")

  console.log("============================================")
  console.log("🧪 TEST: Cleanup preserves manual data")
  console.log("============================================\n")

  // --- Step 0: Ensure DB is clean of seeded data ---
  console.log("Step 0: Cleaning any leftover seeded data...")
  await prisma.user.deleteMany({ where: { email: { in: ALL_SEEDED_EMAILS } } })
  console.log("   Done.\n")

  // --- Step 1: Create manual data BEFORE seeding ---
  console.log("Step 1: Creating manual test data...")

  const manualOrg = await prisma.user.create({
    data: {
      email: "manual-org@test.com",
      password: hashedPassword,
      name: "Manual Test Org",
      role: UserRole.ORGANIZATION,
      isVerified: true,
      organizationProfile: {
        create: {
          domain: "manual-test.com",
          description: "A manually created test organization",
        },
      },
    },
    include: { organizationProfile: true },
  })

  const manualEndpoint = await prisma.apiEndpoint.create({
    data: {
      name: "Manual Test Endpoint",
      description: "This endpoint was created manually, not by seed.",
      forwardUrl: "https://manual-test.com/api",
      method: "POST",
      pricePer1k: 5.0,
      isActive: true,
      orgProfileId: manualOrg.organizationProfile!.id,
    },
  })

  const manualIndividual = await prisma.user.create({
    data: {
      email: "manual-user@test.com",
      password: hashedPassword,
      name: "Manual Test User",
      role: UserRole.INDIVIDUAL,
      isVerified: true,
      creditBalance: 999.0,
      individualProfile: {
        create: {
          bio: "I am a manually created user.",
          location: "Test City",
        },
      },
      apiKey: {
        create: { key: "apk_manual_test_key_12345" },
      },
    },
    include: { apiKey: true },
  })

  // Create a manual credit transaction
  await prisma.creditTransaction.create({
    data: {
      userId: manualIndividual.id,
      amount: 999.0,
      type: CreditTransactionType.TOPUP,
      description: "Manual top-up",
    },
  })

  // Create a manual usage log on the manual endpoint
  await prisma.apiUsageLog.create({
    data: {
      userId: manualIndividual.id,
      endpointId: manualEndpoint.id,
      apiKeyId: manualIndividual.apiKey!.id,
      isFree: false,
      costCharged: 1.25,
      statusCode: 200,
    },
  })

  console.log(`   Manual org user: ${manualOrg.email} (id: ${manualOrg.id})`)
  console.log(`   Manual endpoint: ${manualEndpoint.name} (id: ${manualEndpoint.id})`)
  console.log(`   Manual individual: ${manualIndividual.email} (id: ${manualIndividual.id})`)
  console.log(`   Manual API key: ${manualIndividual.apiKey!.key}`)
  console.log(`   Manual usage log created`)
  console.log(`   Manual credit transaction created\n`)

  // --- Step 2: Run the seed script ---
  console.log("Step 2: Running seed script...")
  const { execSync } = require("child_process")
  execSync("npx tsx prisma/seed.ts", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: "inherit",
  })
  console.log("   Seed complete.\n")

  // --- Step 3: Verify seeded data exists alongside manual data ---
  console.log("Step 3: Verifying state before cleanup...")
  const beforeUsers = await prisma.user.count()
  const beforeEndpoints = await prisma.apiEndpoint.count()
  const beforeUsageLogs = await prisma.apiUsageLog.count()
  const beforeTransactions = await prisma.creditTransaction.count()
  console.log(`   Total users: ${beforeUsers}`)
  console.log(`   Total endpoints: ${beforeEndpoints}`)
  console.log(`   Total usage logs: ${beforeUsageLogs}`)
  console.log(`   Total credit transactions: ${beforeTransactions}\n`)

  // --- Step 4: Run cleanup script ---
  console.log("Step 4: Running cleanup script...")
  await runCleanupScript()
  console.log("   Cleanup complete.\n")

  // --- Step 5: Verify manual data is preserved ---
  console.log("Step 5: Verifying manual data is preserved...")

  const preservedOrg = await prisma.user.findUnique({ where: { id: manualOrg.id } })
  const preservedEndpoint = await prisma.apiEndpoint.findUnique({ where: { id: manualEndpoint.id } })
  const preservedIndividual = await prisma.user.findUnique({
    where: { id: manualIndividual.id },
    include: { apiKey: true, individualProfile: true },
  })
  const preservedUsageLog = await prisma.apiUsageLog.findFirst({
    where: { userId: manualIndividual.id },
  })
  const preservedTransaction = await prisma.creditTransaction.findFirst({
    where: { userId: manualIndividual.id },
  })

  const checks = [
    { label: "Manual org user preserved", ok: preservedOrg !== null },
    { label: "Manual endpoint preserved", ok: preservedEndpoint !== null },
    { label: "Manual individual user preserved", ok: preservedIndividual !== null },
    { label: "Manual API key preserved", ok: preservedIndividual?.apiKey !== null },
    { label: "Manual individual profile preserved", ok: preservedIndividual?.individualProfile !== null },
    { label: "Manual usage log preserved", ok: preservedUsageLog !== null },
    { label: "Manual credit transaction preserved", ok: preservedTransaction !== null },
  ]

  let allPassed = true
  for (const check of checks) {
    allPassed = allPassed && check.ok
    const icon = check.ok ? "✅" : "❌"
    console.log(`   ${icon} ${check.label}`)
  }

  // --- Step 6: Verify seeded data is removed ---
  console.log("\nStep 6: Verifying seeded data is removed...")

  const remainingSeededUsers = await prisma.user.findMany({
    where: { email: { in: ALL_SEEDED_EMAILS } },
  })
  const seededEndpointIds = [
    "gpt-4-text-generation", // we don't know actual IDs, so query by orgProfile
  ]

  // Find endpoints that belonged to seeded orgs
  const remainingSeededEndpoints = await prisma.apiEndpoint.findMany({
    where: {
      name: {
        in: [
          "GPT-4 Text Generation",
          "Image Classification",
          "Current Weather",
          "7-Day Forecast",
          "Real-Time Stock Price",
          "Currency Exchange Rates",
          "Crypto Market Data",
        ],
      },
    },
  })

  const seededChecks = [
    { label: "Seeded users removed", ok: remainingSeededUsers.length === 0, detail: `${remainingSeededUsers.length} remaining` },
    { label: "Seeded endpoints removed", ok: remainingSeededEndpoints.length === 0, detail: `${remainingSeededEndpoints.length} remaining` },
  ]

  for (const check of seededChecks) {
    allPassed = allPassed && check.ok
    const icon = check.ok ? "✅" : "❌"
    console.log(`   ${icon} ${check.label} (${check.detail})`)
  }

  // --- Step 7: Summary ---
  console.log("\n============================================")
  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED")
    console.log("   Cleanup correctly removes seeded data")
    console.log("   and preserves manually added data.")
  } else {
    console.log("❌ SOME TESTS FAILED")
    console.log("   Review the checks above for details.")
    process.exitCode = 1
  }
  console.log("============================================")

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error("❌ Test failed:", e)
  process.exit(1)
})
