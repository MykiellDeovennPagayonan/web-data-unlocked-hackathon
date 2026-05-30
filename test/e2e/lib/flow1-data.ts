/**
 * Realistic human-looking test data for Flow 1: Free-Tier Abuser.
 * Edit these values to make the demo feel more authentic.
 */

export const TEST_PASSWORD = 'TestPass123!'

export const FLOW1 = {
  apiStoreOrg: {
    name: 'CloudScale Analytics',
    email: 'cloudscale.demo@e2e.local',
    password: TEST_PASSWORD,
    domain: 'cloudscale-analytics.io',
    linkedin: 'https://linkedin.com/company/cloudscale-analytics',
    regNumber: 'US-CA-884291',
    address: '451 Market St, Suite 800, San Francisco, CA 94105',
    description: 'Real-time data analytics platform for enterprise teams.',
  },
  endpoint: {
    name: 'Market Sentiment API',
    description: 'Returns real-time sentiment scores for any stock ticker.',
    forwardUrl: 'http://localhost:8090',
    method: 'GET',
    pricePer1k: 1,
  },
  // Four individual accounts sharing the same device
  abusers: [
    { name: 'Alex Morgan', email: 'alex.morgan.abuse@e2e.local', bio: 'Data enthusiast building dashboards.', location: 'Austin, TX' },
    { name: 'Jordan Blake', email: 'jordan.blake.abuse@e2e.local', bio: 'ML engineer focused on NLP pipelines.', location: 'Seattle, WA' },
    { name: 'Taylor Reed', email: 'taylor.reed.abuse@e2e.local', bio: 'Startup founder exploring AI tools.', location: 'Denver, CO' },
    { name: 'Casey Drew', email: 'casey.drew.abuse@e2e.local', bio: 'Freelance dev working on side projects.', location: 'Portland, OR' },
  ],
  jobBoardOrg: {
    name: 'Vertex Talent',
    email: 'vertex.talent@e2e.local',
    password: TEST_PASSWORD,
    domain: 'vertextalent.com',
    linkedin: 'https://linkedin.com/company/vertex-talent',
    regNumber: 'US-NY-552104',
    address: '120 Broadway, New York, NY 10271',
    description: 'Premier tech recruitment for high-growth startups.',
  },
  job: {
    title: 'Senior Backend Engineer',
    description: 'Build scalable APIs and distributed systems for our core platform. You will work with Node.js, PostgreSQL, and Redis in a high-availability environment.',
    location: 'Remote',
    salaryMin: 140000,
    salaryMax: 190000,
    requirements: '5+ years backend experience, strong in Node.js or Go, familiarity with Docker and Kubernetes.',
  },
  jobSeeker: {
    name: 'Riley Chen',
    email: 'riley.chen.abuse@e2e.local',
    password: TEST_PASSWORD,
    bio: 'Backend engineer specializing in distributed systems and event-driven architecture.',
    location: 'San Diego, CA',
    website: 'https://rileychen.dev',
  },
  application: {
    coverLetter: 'I am excited about the opportunity to contribute to Vertex Talent. I have 6 years of experience building high-throughput APIs and microservices using Node.js and Go. I am particularly drawn to your focus on scalable architecture and would love to bring my expertise in distributed systems to your team.',
    expectedSalary: 165000,
    availability: '2 weeks notice',
    resumeUrl: 'https://example.com/riley-chen-resume.pdf',
  },
} as const
