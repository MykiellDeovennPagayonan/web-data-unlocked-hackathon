import { PrismaClient } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
})

async function main() {
  const result = await prisma.user.deleteMany({
    where: { email: { in: ["manual-org@test.com", "manual-user@test.com"] } },
  })
  console.log(`Cleaned up ${result.count} test user(s)`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
