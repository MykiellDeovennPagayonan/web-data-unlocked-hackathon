import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Cloud,
  Code2,
  DatabaseZap,
  FileCheck2,
  Gauge,
  Globe2,
  LockKeyhole,
  Mail,
  Monitor,
  Network,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  UserCheck,
  UserRound,
  UsersRound,
  Workflow,
} from "lucide-react";
import type { ComponentType } from "react";

export type IconComponent = ComponentType<{ className?: string }>;

export type DecisionTone = "allow" | "verify" | "review" | "limit" | "block";

export const navItems = [
  { label: "Product", href: "#product", hasChevron: true },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Trust Certificates", href: "#trust-certificates" },
  { label: "Use Cases", href: "#use-cases", hasChevron: true },
  { label: "Developers", href: "#developers" },
];

export const incomingEntities = [
  {
    label: "Person",
    value: "jane.doe@acme.com",
    badge: "Employee",
    icon: UserRound,
    tone: "blue",
  },
  {
    label: "Device",
    value: "Chrome 125\nmacOS 14.4",
    badge: "Managed",
    icon: Monitor,
    tone: "green",
  },
  {
    label: "Email",
    value: "jane.doe@acme.com",
    badge: "Verified",
    icon: Mail,
    tone: "green",
  },
  {
    label: "IP Address",
    value: "203.0.113.45\nMoscow, RU",
    badge: "Medium Risk",
    icon: Globe2,
    tone: "amber",
  },
  {
    label: "Organization",
    value: "Acme Corp\nID: acme-12345",
    badge: "Trusted",
    icon: Building2,
    tone: "green",
  },
];

export const gatewayChecks = [
  { label: "Identity Verification", detail: "Valid and authentic", icon: UserCheck },
  { label: "Risk Analysis", detail: "Behavior and context", icon: Network },
  { label: "Behavior Signals", detail: "Activity patterns", icon: Workflow },
  { label: "Reputation Check", detail: "Threat intelligence", icon: ShieldAlert },
  { label: "Policy Evaluation", detail: "Access policies", icon: LockKeyhole },
];

export const decisions: Array<{
  label: string;
  detail: string;
  subdetail: string;
  tone: DecisionTone;
  icon: IconComponent;
}> = [
  {
    label: "Allow",
    detail: "Low risk",
    subdetail: "Full access granted",
    tone: "allow",
    icon: CheckCircle2,
  },
  {
    label: "Verify",
    detail: "Step-up authentication",
    subdetail: "Required",
    tone: "verify",
    icon: ShieldCheck,
  },
  {
    label: "Review",
    detail: "Additional review",
    subdetail: "by security team",
    tone: "review",
    icon: ScanSearch,
  },
  {
    label: "Limit",
    detail: "Restricted access",
    subdetail: "Apply control",
    tone: "limit",
    icon: Gauge,
  },
  {
    label: "Block",
    detail: "High risk",
    subdetail: "Access denied",
    tone: "block",
    icon: ShieldAlert,
  },
];

export const partners = ["Microsoft", "aws", "Google Cloud", "okta", "Cloudflare", "Gartner"];

export const trustSteps = [
  {
    number: "1",
    title: "Collect Signals",
    body: "Gather identity, device, IP, email, and behavior signals in real time from every interaction.",
    pill: "Real-time data coverage",
    diagram: "signals",
  },
  {
    number: "2",
    title: "Evaluate Trust",
    body: "Analyze risk, reputation, historical context, and behavior patterns using AI-powered models.",
    pill: "Continuous risk evaluation",
    diagram: "rings",
  },
  {
    number: "3",
    title: "Make the Right Call",
    body: "Automatically recommend the right action-or apply your policy-to allow, verify, review, limit, or block.",
    pill: "Policy-driven decisions",
    diagram: "fanout",
  },
];

export const certificateFeatures = [
  {
    title: "Verifiable",
    body: "Cryptographically signed and instantly verifiable.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent",
    body: "Clear visibility into who issued it, what was verified, and when.",
    icon: BadgeCheck,
  },
  {
    title: "Auditable",
    body: "Complete audit trail for every certificate and update.",
    icon: FileCheck2,
  },
  {
    title: "Recognized across platforms",
    body: "Accepted anywhere in the Tunai ecosystem and beyond.",
    icon: Globe2,
  },
];

export const dashboardFeatures = [
  {
    title: "Live threat and access monitoring",
    body: "See critical events, risk scores, and trends as they happen.",
    icon: Network,
  },
  {
    title: "AI-powered risk insights",
    body: "Tunai surfaces what matters most so you can stop threats early.",
    icon: ShieldCheck,
  },
  {
    title: "Global context",
    body: "Visualize attack origins and high-risk activity across regions.",
    icon: Globe2,
  },
];

export const mockMetrics = [
  { label: "ACCESS EVENTS", value: "1.24M", delta: "12.5%", icon: Network, tone: "blue" },
  { label: "IDENTITIES", value: "18,392", delta: "8.1%", icon: UserRound, tone: "blue" },
  { label: "RISKY EVENTS", value: "2,847", delta: "15.3%", icon: ShieldAlert, tone: "red" },
  { label: "BLOCKED EVENTS", value: "732", delta: "6.2%", icon: LockKeyhole, tone: "red" },
  { label: "TRUST SCORE (AVG)", value: "78", delta: "5 pts", icon: Gauge, tone: "blue" },
];

export const mockEvents = [
  ["14:32:11", "jane.doe@acme.com", "203.0.113.45", "LOGIN", "CRITICAL", "12", "RU Moscow", "Chrome 125"],
  ["14:31:45", "service-account-1", "198.51.100.23", "API ACCESS", "LOW", "85", "US New York", "AkamaiWP.21"],
  ["14:31:02", "mobile_user_392", "45.73.32.11", "LOGIN", "MEDIUM", "56", "GB London", "iOS 17.5"],
  ["14:30:18", "admin@acme.com", "203.0.113.85", "ADMIN ACTION", "LOW", "92", "US San Francisco", "Chrome 125"],
  ["14:30:18", "api-user", "185.199.110.153", "API ACCESS", "HIGH", "18", "BR Sao Paulo", "curl/8.5.0"],
  ["14:28:35", "batch@acme.com", "192.0.2.77", "DATA EXPORT", "MEDIUM", "43", "CA Toronto", "Chrome 125"],
];

export const pendingReviews = [
  ["Critical login from new ASN", "infra-id@acme.com - 203.0.113.45", "2m ago", "critical"],
  ["Impossible travel detected", "admin@acme.com - US -> DE", "11m ago", "medium"],
  ["High volume data export", "backup@acme.com - 192.0.2.77", "11m ago", "critical"],
  ["New device seen", "contractor.user - iPhone iOS 17.5", "26m ago", "medium"],
  ["Unusual API activity", "service-account-1 - 198.51.100.23", "34m ago", "medium"],
];

export const riskRows = [
  ["203.0.113.45", "96 Critical", "1,298"],
  ["198.51.100.23", "85 High", "781"],
  ["45.73.32.11", "73 High", "321"],
  ["185.199.110.153", "56 Medium", "310"],
  ["192.0.2.45", "40 Medium", "410"],
];

export const useCases = [
  {
    title: "Marketplaces",
    body: "Reduce fraud, block fake accounts, and keep your listings and reviews reliable.",
    badge: "Popular",
    icon: ShoppingCart,
  },
  {
    title: "Job Boards",
    body: "Block fake applicants and bot-driven applications to improve quality of hire.",
    badge: "Popular",
    icon: BriefcaseBusiness,
  },
  {
    title: "SaaS Applications",
    body: "Secure sign-ups, prevent seat sharing, and stop account takeover.",
    badge: "Trusted",
    icon: Cloud,
  },
  {
    title: "Online Communities",
    body: "Keep conversations authentic and stop spam, bots, and harmful activity.",
    badge: "Trusted",
    icon: UsersRound,
  },
];

export const featuredUseCaseItems = [
  {
    title: "Verify users and devices before API access",
    body: "Block disposable emails, VPNs, and suspicious sign-ups.",
    icon: ShieldCheck,
  },
  {
    title: "Detect and stop repeat abuse in real time",
    body: "AI signals, risk scoring, and identity correlation.",
    icon: UserCheck,
  },
  {
    title: "Protect resources and ensure fair usage",
    body: "Reduce costs, maintain performance, and build trust.",
    icon: DatabaseZap,
  },
];

export const integrationSteps = [
  {
    title: "Your Platform",
    body: "Send identity, device & context",
    icon: Code2,
    tone: "blue",
  },
  {
    title: "Tunai Evaluation",
    body: "Real-time risk assessment",
    icon: ShieldCheck,
    tone: "blue",
  },
  {
    title: "Trust Signals",
    body: "Scores & insights returned",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    title: "Recommended Action",
    body: "Allow, verify, review or block",
    icon: Gauge,
    tone: "amber",
  },
];

export const codeLines = [
  "import { Tunai } from '@tunai/sdk';",
  "",
  "const tunai = new Tunai({",
  "  apiKey: process.env.TUNAI_API_KEY,",
  "});",
  "",
  "const response = await tunai.evaluate({",
  "  entityType: 'user',",
  "  email: 'jane.doe@acme.com',",
  "  ipAddress: '203.0.113.45',",
  "  action: 'login',",
  "  context: {",
  "    deviceId: 'chrome-125-mac',",
  "    location: 'Moscow, RU',",
  "  },",
  "});",
];

export const footerColumns = [
  ["PRODUCT", "Trust Gateway", "Risk Signals", "Use Cases", "Integrations", "Pricing"],
  ["RESOURCES", "Developer Docs", "API Reference", "Guides", "Blog", "Status"],
  ["COMPANY", "About Tunai", "Careers", "Customers", "Partners", "Contact"],
  ["LEGAL", "Privacy Policy", "Terms of Service", "Data Processing Agreement", "Security", "Compliance"],
];
