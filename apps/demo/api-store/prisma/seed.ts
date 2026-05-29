import { PrismaClient, UserRole, CreditTransactionType } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const SALT_ROUNDS = 10
const DEFAULT_PASSWORD = "TrustLayer123!"

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

const organizations = [
  {
    email: "apis@openai-solutions.demo",
    name: "OpenAI Solutions",
    domain: "openai-solutions.demo",
    linkedin: "https://linkedin.com/company/openai-solutions",
    regNumber: "OAI-2023-001",
    address: "123 AI Boulevard, San Francisco, CA 94105",
    description: "Leading provider of generative AI and machine learning APIs for developers and enterprises. We offer state-of-the-art text generation, image classification, and embedding models.",
    earningsBalance: 1247.85,
  },
  {
    email: "dev@weatherdata.demo",
    name: "WeatherData Inc",
    domain: "weatherdata.demo",
    linkedin: "https://linkedin.com/company/weatherdata",
    regNumber: "WD-2022-089",
    address: "789 Meteorology Lane, Seattle, WA 98109",
    description: "Real-time and forecast weather data APIs trusted by over 50,000 developers worldwide. Hyperlocal conditions, severe weather alerts, and historical climate data.",
    earningsBalance: 842.5,
  },
  {
    email: "platform@financehub.demo",
    name: "FinanceHub Corp",
    domain: "financehub.demo",
    linkedin: "https://linkedin.com/company/financehub",
    regNumber: "FH-2024-042",
    address: "456 Wall Street, New York, NY 10005",
    description: "Financial data APIs for real-time stock prices, cryptocurrency rates, currency exchange, and market analytics. Power your fintech applications with institutional-grade data.",
    earningsBalance: 2156.3,
  },
]

const individuals = [
  {
    email: "alice.chen@email.com",
    name: "Alice Chen",
    bio: "Full-stack developer building AI-powered productivity tools. Passionate about clean APIs and developer experience.",
    location: "San Francisco, CA",
    website: "https://alicechen.dev",
    creditBalance: 45.2,
  },
  {
    email: "bob.martinez@email.com",
    name: "Bob Martinez",
    bio: "Data engineer specializing in real-time streaming pipelines. Loves experimenting with new APIs on side projects.",
    location: "Austin, TX",
    website: "https://bobmartinez.io",
    creditBalance: 12.75,
  },
  {
    email: "carol.wong@email.com",
    name: "Carol Wong",
    bio: "ML researcher and indie hacker. Building a weather-aware travel planner app using public APIs.",
    location: "Seattle, WA",
    website: "https://carolwong.io",
    creditBalance: 89.0,
  },
  {
    email: "david.kim@email.com",
    name: "David Kim",
    bio: "Quantitative developer at a hedge fund. Uses financial data APIs for algorithmic trading research.",
    location: "New York, NY",
    website: "https://davidkim.dev",
    creditBalance: 250.0,
  },
  {
    email: "emma.smith@email.com",
    name: "Emma Smith",
    bio: "Solo founder building a content generation SaaS. Heavy user of text and image APIs.",
    location: "Remote",
    website: "https://emmasmith.co",
    creditBalance: 5.5,
  },
]

const endpointsSeed = [
  {
    name: "GPT-4 Text Generation",
    description: "Generate human-like text for chatbots, content creation, code completion, and more. Supports streaming and custom system prompts.",
    forwardUrl: "https://api.openai-solutions.demo/v1/generate",
    method: "POST",
    samplePayload: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Explain quantum computing in simple terms." },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }, null, 2),
    sampleResponse: JSON.stringify({
      id: "chatcmpl-abc123",
      object: "chat.completion",
      created: 1718123456,
      model: "gpt-4",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Quantum computing is a type of computing that uses quantum mechanics...",
          },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 25, completion_tokens: 120, total_tokens: 145 },
    }, null, 2),
    pricePer1k: 2.5,
    orgIndex: 0,
  },
  {
    name: "Image Classification",
    description: "Classify images into 1000+ categories with state-of-the-art accuracy. Returns confidence scores and top-5 predictions.",
    forwardUrl: "https://api.openai-solutions.demo/v1/classify",
    method: "POST",
    samplePayload: JSON.stringify({
      image: "base64_encoded_image_string",
      top_k: 5,
      model: "resnet-50",
    }, null, 2),
    sampleResponse: JSON.stringify({
      predictions: [
        { label: "golden_retriever", confidence: 0.9823 },
        { label: "labrador_retriever", confidence: 0.0124 },
        { label: "cocker_spaniel", confidence: 0.0031 },
      ],
      model: "resnet-50",
      inference_time_ms: 42,
    }, null, 2),
    pricePer1k: 1.0,
    orgIndex: 0,
  },
  {
    name: "Current Weather",
    description: "Get real-time weather conditions for any location worldwide. Includes temperature, humidity, wind speed, UV index, and visibility.",
    forwardUrl: "https://api.weatherdata.demo/v1/current",
    method: "GET",
    samplePayload: JSON.stringify({}, null, 2),
    sampleResponse: JSON.stringify({
      location: { city: "San Francisco", country: "US", lat: 37.7749, lon: -122.4194 },
      current: {
        temperature_c: 18.5,
        humidity: 72,
        wind_speed_kph: 14,
        uv_index: 5,
        visibility_km: 16,
        condition: "Partly cloudy",
      },
      last_updated: "2024-06-11T14:30:00Z",
    }, null, 2),
    pricePer1k: 0.5,
    orgIndex: 1,
  },
  {
    name: "7-Day Forecast",
    description: "Detailed weather forecast for the next 7 days. Hourly breakdown with precipitation probability, temperature highs/lows, and severe weather alerts.",
    forwardUrl: "https://api.weatherdata.demo/v1/forecast",
    method: "GET",
    samplePayload: JSON.stringify({}, null, 2),
    sampleResponse: JSON.stringify({
      location: { city: "Seattle", country: "US", lat: 47.6062, lon: -122.3321 },
      forecast: [
        { date: "2024-06-12", high_c: 22, low_c: 14, condition: "Sunny", rain_chance: 0 },
        { date: "2024-06-13", high_c: 19, low_c: 12, condition: "Light rain", rain_chance: 65 },
        { date: "2024-06-14", high_c: 17, low_c: 11, condition: "Cloudy", rain_chance: 30 },
      ],
      alerts: [],
    }, null, 2),
    pricePer1k: 0.75,
    orgIndex: 1,
  },
  {
    name: "Real-Time Stock Price",
    description: "Live stock prices, market cap, volume, and daily change for 10,000+ tickers. Sub-second latency with websocket support.",
    forwardUrl: "https://api.financehub.demo/v1/stocks/quote",
    method: "GET",
    samplePayload: JSON.stringify({}, null, 2),
    sampleResponse: JSON.stringify({
      symbol: "AAPL",
      price: 189.52,
      change: 2.34,
      change_percent: 1.25,
      volume: 52341023,
      market_cap: 2890000000000,
      high: 190.12,
      low: 187.45,
      open: 187.8,
      previous_close: 187.18,
      timestamp: "2024-06-11T14:30:00.123Z",
    }, null, 2),
    pricePer1k: 3.0,
    orgIndex: 2,
  },
  {
    name: "Currency Exchange Rates",
    description: "Real-time foreign exchange rates for 170+ currencies. Historical rates, conversion calculator, and volatility indicators.",
    forwardUrl: "https://api.financehub.demo/v1/fx/rates",
    method: "GET",
    samplePayload: JSON.stringify({}, null, 2),
    sampleResponse: JSON.stringify({
      base: "USD",
      date: "2024-06-11",
      rates: {
        EUR: 0.9234,
        GBP: 0.7891,
        JPY: 156.78,
        CAD: 1.3645,
        AUD: 1.5023,
        CHF: 0.8912,
      },
      timestamp: "2024-06-11T14:30:00Z",
    }, null, 2),
    pricePer1k: 1.5,
    orgIndex: 2,
  },
  {
    name: "Crypto Market Data",
    description: "Live cryptocurrency prices, market cap, 24h volume, and price history for 5000+ coins across major exchanges.",
    forwardUrl: "https://api.financehub.demo/v1/crypto/prices",
    method: "GET",
    samplePayload: JSON.stringify({}, null, 2),
    sampleResponse: JSON.stringify({
      symbol: "BTC",
      name: "Bitcoin",
      price_usd: 67432.15,
      change_24h: 1245.3,
      change_24h_percent: 1.88,
      volume_24h: 32500000000,
      market_cap: 1328000000000,
      circulating_supply: 19700000,
      max_supply: 21000000,
      last_updated: "2024-06-11T14:30:00Z",
    }, null, 2),
    pricePer1k: 2.0,
    orgIndex: 2,
  },
]

function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = "apk_"
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function main() {
  const prisma = createPrismaClient()

  console.log("🌱 Starting API Store seed...")

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD)

  // --- Create organizations ---
  console.log("Creating organizations...")
  const createdOrgs: { userId: string; orgProfileId: string }[] = []
  for (const org of organizations) {
    const existing = await prisma.user.findUnique({ where: { email: org.email } })
    if (existing) {
      console.log(`  Skipping ${org.email} (already exists)`)
      const profile = await prisma.organizationProfile.findUnique({ where: { userId: existing.id } })
      if (profile) createdOrgs.push({ userId: existing.id, orgProfileId: profile.id })
      continue
    }

    const user = await prisma.user.create({
      data: {
        email: org.email,
        password: hashedPassword,
        name: org.name,
        role: UserRole.ORGANIZATION,
        isVerified: true,
        organizationProfile: {
          create: {
            domain: org.domain,
            linkedin: org.linkedin,
            regNumber: org.regNumber,
            address: org.address,
            description: org.description,
            earningsBalance: org.earningsBalance,
          },
        },
      },
      include: { organizationProfile: true },
    })
    createdOrgs.push({ userId: user.id, orgProfileId: user.organizationProfile!.id })
    console.log(`  Created organization: ${org.name}`)
  }

  // --- Create individuals ---
  console.log("Creating individuals...")
  const createdIndividuals: { userId: string; profileId: string }[] = []
  for (const person of individuals) {
    const existing = await prisma.user.findUnique({ where: { email: person.email } })
    if (existing) {
      console.log(`  Skipping ${person.email} (already exists)`)
      const profile = await prisma.individualProfile.findUnique({ where: { userId: existing.id } })
      if (profile) createdIndividuals.push({ userId: existing.id, profileId: profile.id })
      continue
    }

    const user = await prisma.user.create({
      data: {
        email: person.email,
        password: hashedPassword,
        name: person.name,
        role: UserRole.INDIVIDUAL,
        isVerified: true,
        creditBalance: person.creditBalance,
        individualProfile: {
          create: {
            bio: person.bio,
            location: person.location,
            website: person.website,
          },
        },
      },
      include: { individualProfile: true },
    })
    createdIndividuals.push({ userId: user.id, profileId: user.individualProfile!.id })
    console.log(`  Created individual: ${person.name}`)
  }

  // --- Create API endpoints ---
  console.log("Creating API endpoints...")
  const createdEndpoints: { id: string; name: string; orgIndex: number; pricePer1k: number }[] = []
  for (const epSeed of endpointsSeed) {
    const org = createdOrgs[epSeed.orgIndex]
    const existing = await prisma.apiEndpoint.findFirst({
      where: { name: epSeed.name, orgProfileId: org.orgProfileId },
    })
    if (existing) {
      console.log(`  Skipping endpoint: ${epSeed.name}`)
      createdEndpoints.push({ id: existing.id, name: existing.name, orgIndex: epSeed.orgIndex, pricePer1k: existing.pricePer1k })
      continue
    }

    const ep = await prisma.apiEndpoint.create({
      data: {
        name: epSeed.name,
        description: epSeed.description,
        forwardUrl: epSeed.forwardUrl,
        method: epSeed.method,
        samplePayload: epSeed.samplePayload,
        sampleResponse: epSeed.sampleResponse,
        pricePer1k: epSeed.pricePer1k,
        isActive: true,
        orgProfileId: org.orgProfileId,
      },
    })
    createdEndpoints.push({ id: ep.id, name: ep.name, orgIndex: epSeed.orgIndex, pricePer1k: ep.pricePer1k })
    console.log(`  Created endpoint: ${ep.name} ($${ep.pricePer1k}/1k)`)
  }

  // --- Create API keys for individuals ---
  console.log("Creating API keys...")
  const createdApiKeys: { id: string; userId: string; key: string }[] = []
  for (const individual of createdIndividuals) {
    const existing = await prisma.userApiKey.findUnique({ where: { userId: individual.userId } })
    if (existing) {
      console.log(`  Skipping API key for ${individual.userId}`)
      createdApiKeys.push({ id: existing.id, userId: existing.userId, key: existing.key })
      continue
    }

    const apiKey = await prisma.userApiKey.create({
      data: {
        userId: individual.userId,
        key: generateApiKey(),
      },
    })
    createdApiKeys.push({ id: apiKey.id, userId: apiKey.userId, key: apiKey.key })
    console.log(`  Created API key for user: ${individual.userId}`)
  }

  // --- Create credit transactions ---
  console.log("Creating credit transactions...")
  const topUpAmounts = [50, 25, 100, 10, 75]
  const deductionDescriptions = [
    { desc: "GPT-4 Text Generation (1,200 calls)", cost: 3.0 },
    { desc: "Current Weather (800 calls)", cost: 0.4 },
    { desc: "Real-Time Stock Price (500 calls)", cost: 1.5 },
    { desc: "Image Classification (2,000 calls)", cost: 2.0 },
    { desc: "Currency Exchange Rates (1,500 calls)", cost: 2.25 },
  ]

  for (let i = 0; i < createdIndividuals.length; i++) {
    const userId = createdIndividuals[i].userId

    // Top-up
    const existingTopup = await prisma.creditTransaction.findFirst({
      where: { userId, type: CreditTransactionType.TOPUP },
    })
    if (!existingTopup) {
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: topUpAmounts[i],
          type: CreditTransactionType.TOPUP,
          description: "Initial credit top-up via Stripe",
        },
      })
      console.log(`  Created top-up: $${topUpAmounts[i]} for user ${userId}`)
    }

    // Deduction
    const existingDeduction = await prisma.creditTransaction.findFirst({
      where: { userId, type: CreditTransactionType.DEDUCTION },
    })
    if (!existingDeduction) {
      const deduction = deductionDescriptions[i]
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: -deduction.cost,
          type: CreditTransactionType.DEDUCTION,
          description: deduction.desc,
        },
      })
      console.log(`  Created deduction: $${deduction.cost} for user ${userId}`)
    }
  }

  // --- Create free trials and usage logs ---
  console.log("Creating usage logs...")
  const now = new Date()

  for (let u = 0; u < createdIndividuals.length; u++) {
    const userId = createdIndividuals[u].userId
    const apiKeyId = createdApiKeys[u].id

    for (let e = 0; e < createdEndpoints.length; e++) {
      const endpoint = createdEndpoints[e]

      // Create or find free trial
      let freeTrial = await prisma.freeTrial.findUnique({
        where: { userId_endpointId: { userId, endpointId: endpoint.id } },
      })
      if (!freeTrial) {
        freeTrial = await prisma.freeTrial.create({
          data: {
            userId,
            endpointId: endpoint.id,
            usedCount: Math.floor(Math.random() * 40) + 10,
          },
        })
      }

      // Create usage logs for this user + endpoint
      const logCount = Math.floor(Math.random() * 5) + 2
      for (let l = 0; l < logCount; l++) {
        const isFree = Math.random() > 0.3
        const costCharged = isFree ? 0 : parseFloat(((Math.random() * 2 + 0.1)).toFixed(4))
        const daysAgo = Math.floor(Math.random() * 30)
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
        const statusCode = Math.random() > 0.1 ? 200 : [429, 500, 503][Math.floor(Math.random() * 3)]

        await prisma.apiUsageLog.create({
          data: {
            userId,
            endpointId: endpoint.id,
            apiKeyId,
            isFree,
            costCharged,
            statusCode,
            createdAt,
          },
        })
      }
    }
    console.log(`  Created usage logs for user: ${userId}`)
  }

  console.log("\n✅ API Store seed completed successfully!")
  console.log(`   ${createdOrgs.length} organizations`)
  console.log(`   ${createdIndividuals.length} individuals`)
  console.log(`   ${createdEndpoints.length} API endpoints`)
  console.log(`   ${createdApiKeys.length} API keys`)
  console.log(`\n   Default password for all accounts: ${DEFAULT_PASSWORD}`)
  console.log(`\n   Organization login emails:`)
  organizations.forEach((o) => console.log(`     - ${o.email}`))
  console.log(`   Individual login emails:`)
  individuals.forEach((i) => console.log(`     - ${i.email}`))

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e)
  process.exit(1)
})
