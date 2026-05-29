import { PrismaClient, UserRole, JobType, JobStatus, ApplicationStatus } from "../generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
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

const SALT_ROUNDS = 10
const DEFAULT_PASSWORD = "TrustLayer123!"

function createPrismaClient() {
  const dbUrl = getDatabaseUrl()
  const pool = new Pool({ connectionString: dbUrl })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

const organizations = [
  {
    email: "hr@techcorp.com",
    name: "TechCorp Inc.",
    domain: "techcorp.com",
    linkedin: "https://linkedin.com/company/techcorp",
    regNumber: "TC-2023-001",
    address: "123 Silicon Valley Blvd, San Francisco, CA 94105",
    description: "Leading enterprise software solutions for Fortune 500 companies. We build scalable cloud platforms and AI-driven analytics tools.",
  },
  {
    email: "careers@startupxyz.com",
    name: "StartupXYZ",
    domain: "startupxyz.com",
    linkedin: "https://linkedin.com/company/startupxyz",
    regNumber: "SX-2024-042",
    address: "456 Innovation Drive, Austin, TX 78701",
    description: "Fast-growing fintech startup revolutionizing digital payments for small businesses across North America.",
  },
  {
    email: "people@cloudscale.io",
    name: "CloudScale Systems",
    domain: "cloudscale.io",
    linkedin: "https://linkedin.com/company/cloudscale",
    regNumber: "CS-2022-089",
    address: "789 Cloud Avenue, Seattle, WA 98109",
    description: "Cloud infrastructure and DevOps automation platform trusted by over 10,000 engineering teams worldwide.",
  },
]

const individuals = [
  {
    email: "alice.chen@email.com",
    name: "Alice Chen",
    bio: "Full-stack developer with 5 years of experience in React, Node.js, and cloud architecture. Passionate about building accessible and performant web applications.",
    location: "San Francisco, CA",
    website: "https://alicechen.dev",
  },
  {
    email: "bob.martinez@email.com",
    name: "Bob Martinez",
    bio: "Product designer specializing in UX research and design systems. Previously led design at two Series B startups.",
    location: "Austin, TX",
    website: "https://bobmartinez.design",
  },
  {
    email: "carol.wong@email.com",
    name: "Carol Wong",
    bio: "Data scientist with expertise in machine learning, NLP, and recommendation systems. PhD in Computer Science from Stanford.",
    location: "Seattle, WA",
    website: "https://carolwong.io",
  },
  {
    email: "david.kim@email.com",
    name: "David Kim",
    bio: "DevOps engineer with deep experience in Kubernetes, Terraform, and CI/CD pipelines. AWS and GCP certified.",
    location: "Remote",
    website: "https://davidkim.dev",
  },
  {
    email: "emma.smith@email.com",
    name: "Emma Smith",
    bio: "Marketing strategist with a track record of scaling B2B SaaS products from $1M to $10M ARR. Expert in SEO, content marketing, and growth loops.",
    location: "New York, NY",
    website: "https://emmasmith.co",
  },
]

const jobsSeed = [
  {
    title: "Senior Full-Stack Engineer",
    description: "We are looking for a Senior Full-Stack Engineer to lead the development of our core product platform. You will architect scalable systems, mentor junior developers, and collaborate closely with product and design teams to deliver exceptional user experiences.\n\nResponsibilities:\n- Design and implement new product features\n- Improve system performance and reliability\n- Mentor junior engineers and conduct code reviews\n- Collaborate with product managers on technical roadmaps",
    location: "San Francisco, CA (Hybrid)",
    salaryMin: 140000,
    salaryMax: 180000,
    jobType: JobType.FULL_TIME,
    requirements: "- 5+ years of professional software engineering experience\n- Expert in React, TypeScript, and Node.js\n- Experience with PostgreSQL and Redis\n- Strong understanding of distributed systems and cloud architecture\n- Excellent communication and leadership skills",
    orgIndex: 0,
  },
  {
    title: "UX Designer",
    description: "Join our design team to craft intuitive and beautiful user experiences for millions of users. You will own the end-to-end design process from research and ideation to high-fidelity prototypes and developer handoff.\n\nResponsibilities:\n- Conduct user research and usability testing\n- Create wireframes, mockups, and interactive prototypes\n- Develop and maintain our design system\n- Work closely with engineers to ensure pixel-perfect implementation",
    location: "Austin, TX (Remote OK)",
    salaryMin: 100000,
    salaryMax: 140000,
    jobType: JobType.FULL_TIME,
    requirements: "- 3+ years of UX/UI design experience\n- Proficiency in Figma and prototyping tools\n- Portfolio demonstrating strong visual and interaction design skills\n- Experience with design systems and component libraries\n- Understanding of accessibility standards (WCAG 2.1)",
    orgIndex: 0,
  },
  {
    title: "DevOps Engineer",
    description: "Help us build world-class infrastructure that powers our platform serving millions of requests daily. You will own our CI/CD pipelines, cloud infrastructure, and observability stack.\n\nResponsibilities:\n- Manage and optimize our AWS/GCP infrastructure\n- Build and maintain CI/CD pipelines\n- Implement infrastructure as code using Terraform\n- Develop monitoring, alerting, and incident response processes",
    location: "Seattle, WA (On-site)",
    salaryMin: 130000,
    salaryMax: 170000,
    jobType: JobType.FULL_TIME,
    requirements: "- 4+ years of DevOps or SRE experience\n- Strong experience with Kubernetes and containerization\n- Proficiency in Terraform, Ansible, or similar IaC tools\n- Experience with observability tools (Datadog, Grafana, Prometheus)\n- Strong scripting skills in Python or Go",
    orgIndex: 1,
  },
  {
    title: "Data Scientist",
    description: "Join our data science team to build predictive models that drive business decisions and enhance our product offerings. You will work with large datasets to uncover insights and build ML pipelines.\n\nResponsibilities:\n- Develop and deploy machine learning models\n- Design and analyze A/B tests\n- Build ETL pipelines and data warehouses\n- Present findings to stakeholders and influence product strategy",
    location: "Remote (US)",
    salaryMin: 120000,
    salaryMax: 160000,
    jobType: JobType.FULL_TIME,
    requirements: "- MS or PhD in Computer Science, Statistics, or related field\n- 3+ years of experience in data science or ML engineering\n- Proficiency in Python, SQL, and ML frameworks (scikit-learn, TensorFlow)\n- Experience with cloud data platforms (Snowflake, BigQuery)\n- Strong statistical analysis and experimental design skills",
    orgIndex: 1,
  },
  {
    title: "Product Marketing Manager",
    description: "Drive go-to-market strategy for our flagship product line. You will craft compelling messaging, enable sales teams, and execute multi-channel campaigns that generate pipeline and revenue.\n\nResponsibilities:\n- Develop product positioning and messaging\n- Create sales enablement materials and competitive battle cards\n- Plan and execute product launches\n- Analyze campaign performance and optimize for ROI",
    location: "New York, NY (Hybrid)",
    salaryMin: 110000,
    salaryMax: 150000,
    jobType: JobType.FULL_TIME,
    requirements: "- 4+ years of product marketing experience in B2B SaaS\n- Proven track record of successful product launches\n- Excellent writing and presentation skills\n- Experience with marketing automation and analytics tools\n- Strong cross-functional collaboration skills",
    orgIndex: 2,
  },
  {
    title: "Backend Engineer (Go)",
    description: "Build high-performance microservices that form the backbone of our platform. You will work on challenging distributed systems problems at scale.\n\nResponsibilities:\n- Design and implement scalable backend services in Go\n- Optimize database queries and caching strategies\n- Build event-driven architectures using Kafka\n- Ensure system reliability through testing and observability",
    location: "San Francisco, CA (Hybrid)",
    salaryMin: 150000,
    salaryMax: 200000,
    jobType: JobType.FULL_TIME,
    requirements: "- 4+ years of backend development experience\n- Strong proficiency in Go (Golang)\n- Experience with microservices and event-driven architecture\n- Deep knowledge of PostgreSQL, Redis, and message queues\n- Understanding of distributed systems and consensus algorithms",
    orgIndex: 2,
  },
  {
    title: "Frontend Engineer (React)",
    description: "Create delightful and accessible user interfaces for our customer-facing dashboard. You will own complex UI features and contribute to our component library.\n\nResponsibilities:\n- Build responsive and accessible UI components\n- Optimize frontend performance (Core Web Vitals)\n- Implement state management and data fetching patterns\n- Contribute to our open-source design system",
    location: "Remote (US)",
    salaryMin: 120000,
    salaryMax: 160000,
    jobType: JobType.FULL_TIME,
    requirements: "- 3+ years of frontend development experience\n- Expert in React, TypeScript, and modern CSS\n- Experience with state management (Zustand, Redux, or similar)\n- Familiarity with testing frameworks (Jest, React Testing Library, Playwright)\n- Eye for detail and passion for great UX",
    orgIndex: 0,
  },
  {
    title: "Site Reliability Engineer",
    description: "Keep our platform running smoothly as we scale. You will define SLOs, reduce toil through automation, and respond to incidents with a blameless culture.\n\nResponsibilities:\n- Define and monitor SLOs/SLIs\n- Automate operational tasks and reduce manual toil\n- Lead incident response and postmortems\n- Improve system reliability through chaos engineering",
    location: "Seattle, WA (On-site)",
    salaryMin: 140000,
    salaryMax: 190000,
    jobType: JobType.FULL_TIME,
    requirements: "- 5+ years of software engineering or SRE experience\n- Strong programming skills in Python or Go\n- Deep knowledge of Linux internals and networking\n- Experience with large-scale distributed systems\n- Excellent debugging and root cause analysis skills",
    orgIndex: 2,
  },
  {
    title: "Growth Marketing Specialist",
    description: "Accelerate our user acquisition and retention through data-driven growth experiments. You will own channels including paid social, SEO, and email marketing.\n\nResponsibilities:\n- Plan and execute multi-channel growth campaigns\n- Run A/B tests to optimize conversion funnels\n- Manage paid advertising budgets and performance\n- Analyze cohort behavior and build retention strategies",
    location: "Austin, TX (Hybrid)",
    salaryMin: 90000,
    salaryMax: 130000,
    jobType: JobType.FULL_TIME,
    requirements: "- 2+ years of growth or digital marketing experience\n- Experience with Facebook Ads, Google Ads, and LinkedIn Ads\n- Strong analytical skills and proficiency in Excel/SQL\n- Familiarity with marketing analytics tools (Mixpanel, Amplitude)\n- Creative mindset with strong copywriting skills",
    orgIndex: 1,
  },
  {
    title: "Staff Software Engineer (Platform)",
    description: "Lead the architecture and development of our internal platform tools and developer experience. You will influence engineering-wide standards and mentor senior engineers.\n\nResponsibilities:\n- Architect and build internal developer platforms\n- Define engineering standards for code quality and testing\n- Lead cross-team technical initiatives\n- Mentor and grow senior and staff engineers",
    location: "San Francisco, CA (Hybrid)",
    salaryMin: 200000,
    salaryMax: 280000,
    jobType: JobType.FULL_TIME,
    requirements: "- 8+ years of software engineering experience\n- Track record of leading large-scale technical initiatives\n- Deep expertise in at least two programming languages\n- Experience building developer platforms or internal tools\n- Strong technical writing and communication skills",
    orgIndex: 0,
  },
]

async function main() {
  const prisma = createPrismaClient()

  console.log("🌱 Starting seed...")

  const hashedPassword = await hashPassword(DEFAULT_PASSWORD)

  console.log("Creating organizations...")
  const createdOrgs: { userId: string; orgId: string }[] = []
  for (const org of organizations) {
    const existing = await prisma.user.findUnique({ where: { email: org.email } })
    if (existing) {
      console.log(`  Skipping ${org.email} (already exists)`)
      const profile = await prisma.organizationProfile.findUnique({ where: { userId: existing.id } })
      if (profile) createdOrgs.push({ userId: existing.id, orgId: profile.id })
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
          },
        },
      },
      include: { organizationProfile: true },
    })
    createdOrgs.push({ userId: user.id, orgId: user.organizationProfile!.id })
    console.log(`  Created organization: ${org.name}`)
  }

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

  console.log("Creating jobs...")
  const createdJobs: { id: string; orgId: string; title: string }[] = []
  const createdJobIds: string[] = []
  for (const jobSeed of jobsSeed) {
    const org = createdOrgs[jobSeed.orgIndex]
    const existing = await prisma.job.findFirst({
      where: { title: jobSeed.title, organizationId: org.orgId },
    })
    if (existing) {
      console.log(`  Skipping job: ${jobSeed.title} at ${organizations[jobSeed.orgIndex].name}`)
      createdJobs.push({ id: existing.id, orgId: existing.organizationId, title: existing.title })
      createdJobIds.push(existing.id)
      continue
    }

    const job = await prisma.job.create({
      data: {
        title: jobSeed.title,
        description: jobSeed.description,
        location: jobSeed.location,
        salaryMin: jobSeed.salaryMin,
        salaryMax: jobSeed.salaryMax,
        jobType: jobSeed.jobType,
        requirements: jobSeed.requirements,
        status: JobStatus.ACTIVE,
        organizationId: org.orgId,
      },
    })
    createdJobs.push({ id: job.id, orgId: job.organizationId, title: job.title })
    createdJobIds.push(job.id)
    console.log(`  Created job: ${job.title}`)
  }

  console.log("Creating applications...")
  const createdApplicationIds: string[] = []
  const applicationPairs = [
    { jobIndex: 0, individualIndex: 0, status: ApplicationStatus.INTERVIEWING, coverLetter: "I am excited about the Senior Full-Stack Engineer role at TechCorp. With my 5 years of experience building scalable web applications, I believe I can make an immediate impact on your platform team. I am particularly drawn to your mission of democratizing enterprise software.", expectedSalary: 165000, availability: "2 weeks notice" },
    { jobIndex: 1, individualIndex: 1, status: ApplicationStatus.PENDING, coverLetter: "As a product designer with a passion for design systems, I would love to contribute to TechCorp's design team. My experience leading design at Series B startups has given me a strong understanding of how to balance speed and quality in fast-moving environments.", expectedSalary: 125000, availability: "Immediate" },
    { jobIndex: 2, individualIndex: 3, status: ApplicationStatus.ACCEPTED, coverLetter: "I have extensive experience managing Kubernetes clusters and building CI/CD pipelines at scale. At my current role, I reduced deployment times by 60% and improved system reliability to 99.99% uptime. I am eager to bring these skills to StartupXYZ.", expectedSalary: 155000, availability: "1 month notice" },
    { jobIndex: 3, individualIndex: 2, status: ApplicationStatus.PENDING, coverLetter: "My research in NLP and recommendation systems during my PhD at Stanford directly aligns with the Data Scientist role. I have published 3 papers on transformer-based recommendation models and would love to apply this expertise to real-world problems at StartupXYZ.", expectedSalary: 145000, availability: "Immediate" },
    { jobIndex: 4, individualIndex: 4, status: ApplicationStatus.REJECTED, coverLetter: "I have a proven track record of scaling B2B SaaS products and would love to bring my go-to-market expertise to CloudScale Systems. My experience in SEO and content marketing has helped previous employers achieve 300% YoY growth.", expectedSalary: 135000, availability: "2 weeks notice" },
    { jobIndex: 5, individualIndex: 0, status: ApplicationStatus.PENDING, coverLetter: "While my primary experience is in full-stack development, I have been working extensively with Go microservices over the past year. I built a high-throughput event ingestion service processing 50k events/sec at my current company.", expectedSalary: 175000, availability: "2 weeks notice" },
    { jobIndex: 6, individualIndex: 1, status: ApplicationStatus.INTERVIEWING, coverLetter: "I am passionate about creating accessible and performant user interfaces. My portfolio includes several large-scale React applications with Lighthouse scores above 95. I would love to contribute to your design system and customer-facing dashboard.", expectedSalary: 140000, availability: "1 month notice" },
    { jobIndex: 7, individualIndex: 3, status: ApplicationStatus.PENDING, coverLetter: "As an SRE, I have defined SLOs for critical services and implemented chaos engineering practices that uncovered critical failure modes before they reached production. I am excited about the opportunity to bring this reliability-focused mindset to CloudScale.", expectedSalary: 170000, availability: "2 weeks notice" },
    { jobIndex: 8, individualIndex: 4, status: ApplicationStatus.ACCEPTED, coverLetter: "I have managed 6-figure monthly ad budgets across Facebook, Google, and LinkedIn with ROAS consistently above 4x. My analytical approach to growth marketing would be a great fit for StartupXYZ's ambitious growth targets.", expectedSalary: 115000, availability: "Immediate" },
    { jobIndex: 0, individualIndex: 2, status: ApplicationStatus.PENDING, coverLetter: "Although my background is in data science, I have strong programming skills in Python and have built several full-stack ML applications. I am eager to expand my engineering skills and contribute to TechCorp's platform.", expectedSalary: 150000, availability: "3 weeks notice" },
  ]

  for (const app of applicationPairs) {
    const job = createdJobs[app.jobIndex]
    const individual = createdIndividuals[app.individualIndex]

    const existing = await prisma.application.findUnique({
      where: { jobId_individualId: { jobId: job.id, individualId: individual.profileId } },
    })
    if (existing) {
      console.log(`  Skipping application: ${individuals[app.individualIndex].name} -> ${job.title}`)
      createdApplicationIds.push(existing.id)
      continue
    }

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        individualId: individual.profileId,
        coverLetter: app.coverLetter,
        expectedSalary: app.expectedSalary,
        availability: app.availability,
        resumeUrl: "https://example.com/resume.pdf",
        status: app.status,
      },
    })
    createdApplicationIds.push(application.id)
    console.log(`  Created application: ${individuals[app.individualIndex].name} -> ${job.title} (${app.status})`)
  }

  const manifest = {
    seededAt: new Date().toISOString(),
    organizationUserIds: createdOrgs.map((o) => o.userId),
    individualUserIds: createdIndividuals.map((i) => i.userId),
    jobIds: createdJobIds,
    applicationIds: createdApplicationIds,
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log(`\n📝 Manifest written to ${MANIFEST_PATH}`)

  console.log("\n✅ Seed completed successfully!")
  console.log(`   ${createdOrgs.length} organizations`)
  console.log(`   ${createdIndividuals.length} individuals`)
  console.log(`   ${createdJobs.length} jobs`)
  console.log(`   ${applicationPairs.length} applications`)
  console.log(`\n   Default password for all accounts: ${DEFAULT_PASSWORD}`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error("❌ Seed failed:", e)
  process.exit(1)
})
