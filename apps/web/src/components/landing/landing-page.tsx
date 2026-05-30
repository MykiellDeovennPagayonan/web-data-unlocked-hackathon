import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleHelp,
  Code2,
  Eye,
  FileText,
  Filter,
  Heart,
  KeyRound,
  Menu,
  MoreHorizontal,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  certificateFeatures,
  codeLines,
  dashboardFeatures,
  decisions,
  featuredUseCaseItems,
  footerColumns,
  gatewayChecks,
  incomingEntities,
  integrationSteps,
  mockEvents,
  mockMetrics,
  navItems,
  pendingReviews,
  riskRows,
  trustSteps,
  useCases,
} from "./landing-data";
import {
  BrandLogo,
  DecisionCard,
  ExternalTextLink,
  EyebrowPill,
  IconTile,
  MiniEcosystemLogo,
  PrimaryButton,
  SectionTrustNote,
  SecondaryButton,
  SocialLinks,
  StatusPill,
  TinyCheck,
  TrustedPartnersStrip,
  TrustScoreRing,
} from "./landing-primitives";

export function LandingPage() {
  return (
    <div
      id="top"
      className="min-h-screen overflow-x-hidden bg-[#f7faff] text-[#071b4d] antialiased"
    >
      <LandingHeader />
      <main>
        <HeroSection />
        <ThreeStepTrustSection />
        <TrustCertificateSection />
        <DashboardPreviewSection />
        <UseCasesSection />
        <DeveloperIntegrationSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}

function LandingHeader() {
  return (
    <header className="mx-auto mt-3 flex h-[68px] w-[calc(100%-24px)] max-w-[1404px] items-center rounded-xl border border-[#dce8f7] bg-white px-4 shadow-[0_10px_30px_rgba(9,38,94,0.06)] sm:mt-5 sm:h-[82px] sm:w-[calc(100%-40px)] sm:px-7 xl:px-9">
      <BrandLogo />
      <nav
        className="mx-auto hidden items-center gap-9 lg:flex"
        aria-label="Primary navigation"
      >
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#203861] hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {item.label}
            {item.hasChevron ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : null}
          </a>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-7">
        <a
          href="#developers"
          className="hidden text-[15px] font-bold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:inline-flex"
        >
          View Developer Docs
        </a>
        <PrimaryButton
          href="#demo"
          className="hidden h-11 rounded-md px-5 md:inline-flex"
        >
          Request a Demo
        </PrimaryButton>
        <details className="group relative lg:hidden">
          <summary
            className="grid size-11 cursor-pointer list-none place-items-center rounded-md border border-[#dce8f7] text-[#203861] transition-colors hover:bg-blue-50 [&::-webkit-details-marker]:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-[54px] z-50 grid w-[min(290px,calc(100vw-32px))] gap-1 rounded-xl border border-[#dce8f7] bg-white p-3 shadow-[0_18px_46px_rgba(11,27,77,0.12)]"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex min-h-11 items-center justify-between rounded-lg px-3 text-[14px] font-bold text-[#203861] hover:bg-blue-50 hover:text-blue-600"
              >
                {item.label}
                {item.hasChevron ? (
                  <ChevronDown className="size-4" aria-hidden="true" />
                ) : null}
              </a>
            ))}
            <a
              href="#developers"
              className="mt-1 flex min-h-11 items-center rounded-lg border border-[#dce8f7] px-3 text-[14px] font-bold text-blue-600 hover:bg-blue-50"
            >
              View Developer Docs
            </a>
            <PrimaryButton href="#demo" className="mt-1 h-11 w-full px-4">
              Request a Demo
            </PrimaryButton>
          </nav>
        </details>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="product"
      className="relative px-4 pb-14 pt-14 sm:px-5 sm:pb-16 sm:pt-[76px] xl:pt-[92px]"
    >
      <div className="mx-auto grid max-w-[1404px] items-center gap-10 xl:grid-cols-[520px_minmax(0,1fr)] xl:gap-5">
        <div>
          <EyebrowPill icon={Sparkles}>
            AI-Native Identity Trust and Access Security
          </EyebrowPill>
          <h1 className="mt-8 max-w-[545px] text-[42px] font-extrabold leading-[1.14] tracking-[-0.02em] text-[#061747] sm:mt-10 sm:text-[54px] lg:text-[60px] xl:mt-11">
            Know who to trust before access becomes a risk.
          </h1>
          <p className="mt-6 max-w-[520px] text-[18px] font-medium leading-[1.65] text-[#526991] sm:mt-8 sm:text-[20px]">
            Tunai evaluates people, devices, emails, IPs, and organizations in
            real time—so you can grant the right access with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-11 sm:flex-row sm:flex-wrap sm:gap-4">
            <PrimaryButton className="w-full sm:w-auto">
              Request a Demo
            </PrimaryButton>
            <SecondaryButton icon={PlayCircle} className="w-full sm:w-auto">
              Explore How It Works
            </SecondaryButton>
          </div>
          <div className="mt-9 flex max-w-[470px] items-center gap-4 text-[15px] font-semibold leading-6 text-[#607196] sm:mt-12 sm:gap-5 sm:text-[17px] sm:leading-7">
            <span className="grid size-12 place-items-center rounded-full bg-blue-50 text-blue-600">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <span>
              Stronger trust decisions. Fewer false positives. No unnecessary
              friction.
            </span>
          </div>
        </div>
        <HeroTrustGatewayDiagram />
      </div>
      <TrustedPartnersStrip className="mt-12" />
    </section>
  );
}

function HeroTrustGatewayDiagram() {
  return (
    <>
      <HeroTrustGatewayDiagramDesktop />
      <MobileHeroGatewayDiagram />
    </>
  );
}

function MobileHeroGatewayDiagram() {
  const visibleEntities = incomingEntities.slice(0, 3);
  const visibleDecisions = decisions.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[760px] rounded-2xl border border-[#dce8f7] bg-white p-4 shadow-[0_18px_46px_rgba(11,27,77,0.055)] sm:p-6 xl:hidden">
      <div className="grid gap-5 md:grid-cols-[1fr_72px_1fr] md:items-center">
        <div>
          <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#7889a9]">
            Incoming entities
          </div>
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
            {visibleEntities.map((entity) => (
              <IncomingEntityCard key={entity.label} {...entity} compact />
            ))}
          </div>
        </div>
        <div className="grid place-items-center">
          <span className="grid size-11 rotate-90 place-items-center rounded-full bg-blue-600 text-white shadow-[0_8px_20px_rgba(11,111,246,0.25)] md:rotate-0">
            <ArrowRight className="size-5" aria-hidden="true" />
          </span>
        </div>
        <div className="rounded-xl border border-blue-300 bg-[#fbfdff] p-4 shadow-[0_12px_30px_rgba(11,111,246,0.08)]">
          <div className="flex items-center gap-3">
            <BrandLogo compact />
            <div>
              <div className="text-[14px] font-extrabold text-blue-600">
                Trust Gateway
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-[#607196]">
                Identity and policy evaluation
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {gatewayChecks.slice(0, 3).map((check) => (
              <div
                key={check.label}
                className="flex items-center gap-2 rounded-lg border border-[#e2eaf6] bg-white p-2.5"
              >
                <IconTile
                  icon={check.icon}
                  className="size-7 rounded-full [&_svg]:size-4"
                />
                <span className="min-w-0 flex-1 text-[11px] font-extrabold text-[#071b4d]">
                  {check.label}
                </span>
                <TinyCheck />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-[#eef5ff] px-3 py-2.5">
            <span className="text-[12px] font-extrabold">Trust Score</span>
            <span className="flex items-center gap-1.5 text-[22px] font-extrabold">
              78 <span className="text-[11px] text-[#607196]">/100</span>
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {visibleDecisions.map((decision) => (
          <DecisionCard
            key={decision.label}
            {...decision}
            className="min-h-[86px] px-4 py-3 shadow-none"
          />
        ))}
      </div>
    </div>
  );
}

function HeroTrustGatewayDiagramDesktop() {
  return (
    <div className="relative mx-auto hidden h-full w-[760px] overflow-visible xl:block">
      <div className="relative grid h-full w-full grid-cols-[180px_260px_220px] items-center gap-[36px]">
        <div>
          <div className="mb-3 text-center text-[12px] font-bold text-[#54658a]">
            Incoming Entities
          </div>
          <div className="space-y-2">
            {incomingEntities.map((entity) => (
              <IncomingEntityCard key={entity.label} {...entity} />
            ))}
          </div>
        </div>
        <GatewayEvaluationPanel />
        <div className="relative z-10">
          <div className="mb-3 text-center text-[12px] font-bold text-[#54658a]">
            Access Decision
          </div>
          <div className="space-y-2">
            {decisions.map((decision) => (
              <DecisionCard
                key={decision.label}
                {...decision}
                className="h-[86px] px-4 py-2 shadow-none"
              />
            ))}
          </div>
        </div>
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 760 460"
          aria-hidden="true"
        >
          {/* Entity → Gateway curved converging lines */}
          <path d="M180 65 H190 Q198 65 198 113 V225" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M180 145 H190 Q198 145 198 185 V225" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M180 225 H198" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M180 305 H190 Q198 305 198 265 V225" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M180 385 H190 Q198 385 198 337 V225" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />

          {/* Arrow node → Gateway */}
          <path d="M210 225 L216 225" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />

          {/* Gateway → Right arrow node */}
          <path d="M476 225 L482 225" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />

          {/* Right arrow → Decisions curved diverging lines */}
          <path d="M494 225 V113 Q494 65 502 65 H512" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M494 225 V185 Q494 145 502 145 H512" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M494 225 H512" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M494 225 V265 Q494 305 502 305 H512" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M494 225 V337 Q494 385 502 385 H512" fill="none" stroke="#155DFC" strokeDasharray="3 3" strokeWidth="1" />

          {/* Left arrow node (rendered last so it's on top) */}
          <circle cx="198" cy="225" r="12" fill="#3b82f6" />
          <path d="M194 225 L200 225 M197 222 L200 225 L197 228" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Right arrow node (rendered last so it's on top) */}
          <circle cx="494" cy="225" r="12" fill="#3b82f6" />
          <path d="M490 225 L496 225 M493 222 L496 225 L493 228" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function IncomingEntityCard({
  label,
  value,
  badge,
  icon,
  tone,
  compact = false,
}: {
  label: string;
  value: string;
  badge: string;
  icon: typeof ShieldCheck;
  tone: string;
  compact?: boolean;
}) {
  const badgeTone =
    tone === "green" ? "green" : tone === "amber" ? "amber" : "blue";

  return (
    <article
      className={cn(
        "relative z-10 flex items-center gap-3 rounded-xl border border-[#dce8f7] bg-white px-3.5 shadow-[0_9px_26px_rgba(11,27,77,0.05)]",
        compact ? "h-[86px] py-2" : "h-[86px] py-2",
      )}
    >
      <IconTile
        icon={icon}
        tone={badgeTone}
        className="size-10 rounded-full"
      />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-extrabold text-[#071b4d]">{label}</div>
        <div className="mt-0.5 whitespace-pre-line text-[10px] font-medium leading-[1.3] text-[#526991]">
          {value}
        </div>
        <StatusPill
          tone={badgeTone}
          className="mt-1 w-fit py-0.5 text-[10px]"
        >
          {badge}
        </StatusPill>
      </div>
    </article>
  );
}

function GatewayEvaluationPanel() {
  return (
    <article className="relative z-10 rounded-2xl border border-blue-300 bg-[#fbfdff] p-4 text-center shadow-[0_16px_44px_rgba(11,111,246,0.09)]">
      <BrandLogo className="justify-center gap-3" />
      <div className="mt-3 text-[16px] font-extrabold text-blue-600">
        Trust Gateway
      </div>
      <div className="mt-1 text-[11px] font-semibold text-[#607196]">
        Identity and policy evaluation
      </div>
      <div className="relative mx-auto mt-2 grid h-[120px] place-items-center">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 170 170"
          aria-hidden="true"
        >
          <defs>
            <filter id="shieldGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#155DFC" floodOpacity="0.35" />
            </filter>
          </defs>
          {/* Soft glow behind center with shadow */}
          <circle cx="85" cy="85" r="36" fill="#eef5ff" opacity="0.6" filter="url(#shieldGlow)" />
          {/* Outer dashed circles (3 remaining) */}
          {[52, 68, 84].map((r, index) => (
            <circle
              key={r}
              cx="85"
              cy="85"
              r={r}
              fill="none"
              stroke={index % 2 ? "#cfe1ff" : "#bdd6ff"}
              strokeDasharray={index % 2 ? "4 5" : "2 4"}
              strokeWidth="1.2"
            />
          ))}
        </svg>
        <span className="grid size-14 place-items-center rounded-full bg-white">
          <ShieldCheck className="size-7 stroke-[2.2]" style={{ color: '#155DFC' }} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 space-y-1">
        {gatewayChecks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-3 rounded-lg border border-[#e2eaf6] bg-white px-3 py-1.5 text-left shadow-[0_6px_18px_rgba(11,27,77,0.035)]"
          >
            <IconTile
              icon={check.icon}
              className="size-7 rounded-full [&_svg]:size-4"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-extrabold text-[#071b4d]">
                {check.label}
              </div>
              <div className="text-[10px] font-medium text-[#607196]">
                {check.detail}
              </div>
            </div>
            <TinyCheck />
          </div>
        ))}
      </div>
      <div className="mt-2 flex h-11 items-center justify-between rounded-lg bg-[#eef5ff] px-4">
        <span className="text-[12px] font-extrabold text-[#071b4d]">
          Trust Score
        </span>
        <span className="flex items-center gap-2">
          <span className="text-[24px] font-extrabold">78</span>
          <span className="text-[11px] font-bold text-[#607196]">/100</span>
          <TrustScoreRing value={78} size={40} showValue={false} />
        </span>
      </div>
    </article>
  );
}

function ThreeStepTrustSection() {
  return (
    <section
      id="how-it-works"
      className="px-4 pb-16 pt-14 sm:px-5 sm:pb-[92px] sm:pt-[76px]"
    >
      <div className="mx-auto max-w-[1240px] text-center">
        <EyebrowPill>AI-NATIVE IDENTITY TRUST</EyebrowPill>
        <h2 className="mx-auto mt-5 max-w-[1180px] text-[38px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#061747] sm:text-[48px] lg:text-[56px]">
          Identity trust in three simple steps.
        </h2>
        <p className="mx-auto mt-5 max-w-[760px] text-[17px] font-medium leading-7 text-[#526991] sm:mt-6 sm:text-[20px] sm:leading-8">
          Tunai continuously evaluates signals in real time to deliver accurate
          trust decisions you can act on with confidence.
        </p>
        <div className="relative mt-9 grid gap-5 sm:mt-12 sm:gap-7 lg:grid-cols-3 lg:gap-9">
          {trustSteps.map((step) => (
            <TrustStepCard key={step.number} step={step} />
          ))}
          <div className="pointer-events-none absolute left-[31.8%] top-[172px] hidden items-center lg:flex">
            <ConnectorArrow />
          </div>
          <div className="pointer-events-none absolute right-[31.8%] top-[172px] hidden items-center lg:flex">
            <ConnectorArrow />
          </div>
        </div>
        <DecisionLegend />
        <SectionTrustNote />
      </div>
    </section>
  );
}

function ConnectorArrow() {
  return (
    <div className="flex items-center">
      <span className="h-px w-7 border-t-2 border-dashed border-[#72a8ff]" />
      <span className="grid size-9 place-items-center rounded-full bg-blue-600 text-white shadow-[0_8px_20px_rgba(11,111,246,0.25)]">
        <ArrowRight className="size-5" aria-hidden="true" />
      </span>
      <span className="h-px w-7 border-t-2 border-dashed border-[#72a8ff]" />
    </div>
  );
}

function TrustStepCard({ step }: { step: (typeof trustSteps)[number] }) {
  return (
    <article className="relative min-h-[390px] rounded-2xl border border-[#dce8f7] bg-white px-5 pb-6 pt-5 shadow-[0_12px_36px_rgba(11,27,77,0.035)] sm:min-h-[430px] sm:px-8 sm:pb-8">
      <span className="absolute left-5 top-5 grid size-10 place-items-center rounded-lg bg-blue-50 text-[22px] font-extrabold text-blue-600">
        {step.number}
      </span>
      <StepDiagram kind={step.diagram} />
      <h3 className="mt-6 text-[25px] font-extrabold">{step.title}</h3>
      <p className="mx-auto mt-4 max-w-[270px] text-[16px] font-medium leading-7 text-[#526991]">
        {step.body}
      </p>
      <div className="mx-auto mt-7 inline-flex h-9 items-center gap-3 rounded-lg bg-[#eef5ff] px-4 text-[14px] font-bold text-blue-600">
        <span className="size-2 rounded-full bg-blue-600" />
        {step.pill}
      </div>
    </article>
  );
}

function StepDiagram({ kind }: { kind: string }) {
  if (kind === "signals") {
    return (
      <div className="relative mx-auto mt-9 h-[142px] w-[170px]">
        <div className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dbe7f7]" />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 170 142"
          aria-hidden="true"
        >
          <path
            d="M45 62 L85 100 L85 42 M125 62 L85 100"
            fill="none"
            stroke="#72a8ff"
            strokeDasharray="4 4"
            strokeWidth="2"
          />
        </svg>
        <div className="absolute left-[22px] top-[46px] grid size-9 place-items-center rounded-lg bg-[#eef5ff] text-blue-600">
          <span className="h-3 w-5 border-2 border-current border-b-4" />
        </div>
        <div className="absolute left-[68px] top-[22px] grid size-9 place-items-center rounded-lg bg-[#eef5ff] text-blue-600">
          <span className="relative block size-5 rounded-full border-2 border-current before:absolute before:-bottom-2 before:left-1/2 before:h-2 before:w-5 before:-translate-x-1/2 before:rounded-t-full before:border-2 before:border-current before:border-b-0" />
        </div>
        <div className="absolute left-[112px] top-[46px] grid size-9 place-items-center rounded-lg bg-[#eef5ff] text-blue-600">
          <span className="grid size-5 place-items-center rounded-full border-2 border-current text-[10px] font-bold">
            o
          </span>
        </div>
        <div className="absolute left-[68px] top-[88px] grid size-9 place-items-center rounded-lg bg-white text-blue-600 shadow-sm">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (kind === "rings") {
    return (
      <div className="mx-auto mt-8 grid h-[150px] place-items-center">
        <div className="relative grid size-[150px] place-items-center">
          <svg
            className="absolute inset-0"
            viewBox="0 0 150 150"
            aria-hidden="true"
          >
            {[36, 52, 68].map((r) => (
              <circle
                key={r}
                cx="75"
                cy="75"
                r={r}
                fill="none"
                stroke="#cfe1ff"
                strokeDasharray="4 5"
              />
            ))}
          </svg>
          <ShieldCheck
            className="size-16 text-blue-600 drop-shadow-sm"
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 h-[150px] w-[230px]">
      <svg viewBox="0 0 230 150" className="h-full w-full" aria-hidden="true">
        <circle cx="115" cy="30" r="28" fill="#fff" stroke="#dbe7f7" />
        <path
          d="M115 58 V78 M55 78 H175 M55 78 Q37 78 37 96 V105 M95 78 V105 M135 78 V105 M175 78 V105"
          fill="none"
          stroke="#72a8ff"
          strokeDasharray="4 5"
          strokeWidth="2"
        />
        <ShieldCheck x="101" y="16" width="28" height="28" color="#0b6ff6" />
        <StepDecision x={18} y={103} tone="#0b6ff6" />
        <StepDecision x={78} y={103} tone="#f59e0b" />
        <StepDecision x={118} y={103} tone="#f97316" />
        <StepDecision x={172} y={103} tone="#ef4444" />
      </svg>
    </div>
  );
}

function StepDecision({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="20" cy="20" r="20" fill={`${tone}16`} />
      <circle cx="20" cy="20" r="8" fill={tone} />
    </g>
  );
}

function DecisionLegend() {
  return (
    <section className="mt-8 grid min-h-[160px] items-center gap-6 rounded-xl border border-[#dce8f7] bg-white px-4 py-5 text-left shadow-[0_12px_34px_rgba(11,27,77,0.04)] sm:mt-12 sm:px-8 sm:py-8 lg:grid-cols-[190px_1fr]">
      <div>
        <h3 className="text-[17px] font-extrabold">Five possible decisions</h3>
        <p className="mt-4 text-[15px] font-medium leading-6 text-[#526991]">
          Flexible outcomes to match your risk tolerance.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.label}
            {...decision}
            className="min-h-[94px] px-4 py-3"
          />
        ))}
      </div>
    </section>
  );
}

function TrustCertificateSection() {
  return (
    <section
      id="trust-certificates"
      className="px-4 pb-20 pt-10 sm:px-5 sm:pb-[112px] sm:pt-[60px]"
    >
      <div className="mx-auto grid max-w-[1298px] items-center gap-10 xl:grid-cols-[600px_minmax(0,1fr)] xl:gap-[86px]">
        <TrustCertificateCard />
        <div>
          <EyebrowPill>TRUST CERTIFICATES</EyebrowPill>
          <h2 className="mt-7 max-w-[570px] text-[42px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#061747] sm:mt-8 sm:text-[54px] lg:text-[64px]">
            Verified once. Trusted across the network.
          </h2>
          <p className="mt-8 max-w-[590px] text-[19px] font-medium leading-8 text-[#526991]">
            Tunai Trust Certificates prove that an identity, device, or
            organization meets rigorous security and compliance standards—so you
            can grant access with confidence.
          </p>
          <div className="mt-8 space-y-6">
            {certificateFeatures.map((feature) => (
              <div key={feature.title} className="flex items-center gap-5">
                <IconTile
                  icon={feature.title === "Transparent" ? Eye : feature.icon}
                  className="size-14 rounded-lg"
                />
                <div>
                  <h3 className="text-[17px] font-extrabold">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[15px] font-medium text-[#526991]">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-[#dce8f7] pt-6">
            <div className="mb-4 text-[17px] font-bold text-[#526991]">
              Trusted across the ecosystem
            </div>
            <div className="flex flex-wrap items-center gap-6">
              {["aws", "MS", "G", "okta", "CF", "+ More"].map((label) => (
                <MiniEcosystemLogo key={label} label={label} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustCertificateCard() {
  return (
    <article className="relative mx-auto min-h-[720px] w-full max-w-[600px] overflow-hidden rounded-xl border border-[#c8dcfb] bg-white p-5 shadow-[0_16px_42px_rgba(11,27,77,0.05)] sm:min-h-[820px] sm:p-9 lg:min-h-[865px] lg:p-[54px]">
      <div className="pointer-events-none absolute inset-4 rounded-lg border border-blue-100 opacity-80" />
      <div className="pointer-events-none absolute inset-8 rounded-[50%] border border-blue-100 opacity-30" />
      <div className="pointer-events-none absolute -left-10 top-8 h-[190px] w-[660px] rounded-[50%] border border-blue-100 opacity-35" />
      <div className="relative text-center">
        <ShieldCheck
          className="mx-auto size-14 text-blue-600 sm:size-16"
          aria-hidden="true"
        />
        <div className="mt-3 text-[20px] font-extrabold tracking-[0.22em] sm:mt-4 sm:text-[24px]">
          TUNAI
        </div>
        <h3 className="mt-4 text-[35px] font-extrabold leading-tight text-[#12356a] sm:mt-5 sm:text-[43px]">
          Trust Certificate
        </h3>
        <div className="mt-6 text-[12px] font-extrabold uppercase text-[#6a7ba0] sm:mt-8 sm:text-[15px]">
          This certificate confirms that
        </div>
        <div className="mt-4 break-words text-[31px] font-extrabold sm:mt-6 sm:text-[44px]">
          Acme Corporation
        </div>
        <div className="relative mx-auto my-8 h-px max-w-[420px] bg-[#d9e5f6]">
          <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#d9e5f6]" />
        </div>
      </div>
      <div className="relative space-y-5 text-[14px] font-semibold sm:space-y-6 sm:text-[17px]">
        <CertificateRow
          label="Certificate ID"
          value="TUNAI-7F3B-9C21-8D54"
          strong
        />
        <CertificateRow label="Valid Until" value="May 20, 2026" />
        <CertificateRow
          label="Status"
          value={<StatusPill tone="green">Active</StatusPill>}
        />
      </div>
      <div className="relative mt-6 flex items-center gap-3 rounded-lg border border-[#dce8f7] bg-[#f5f9ff] p-3 sm:mt-8 sm:gap-5 sm:p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-blue-600 shadow-sm sm:size-14">
          <ShieldCheck className="size-6 sm:size-8" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-extrabold text-blue-700 sm:text-[16px]">
            Verified by Tunai Trust Gateway
          </div>
          <div className="mt-1 text-[12px] font-medium leading-5 text-[#526991] sm:text-[15px] sm:leading-6">
            Identity and security posture validated against Tunai Trust
            Standards
          </div>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-emerald-400 text-emerald-500 sm:size-10">
          <BadgeCheck className="size-5 sm:size-7" aria-hidden="true" />
        </span>
      </div>
      <div className="absolute inset-x-3 bottom-4 h-[164px] sm:h-[188px] rounded-b-lg border-t border-[#dce8f7] bg-[radial-gradient(circle_at_30%_40%,rgba(11,111,246,0.08),transparent_34%),linear-gradient(135deg,rgba(235,245,255,0.8),rgba(255,255,255,0.6))]" />
      <div className="relative mt-[66px] grid grid-cols-3 items-end gap-3 sm:mt-[88px] sm:gap-6">
        <CertificateStamp />
        <div className="text-center">
          <svg
            className="mx-auto h-10 w-24 sm:h-14 sm:w-36"
            viewBox="0 0 150 56"
            aria-hidden="true"
          >
            <path
              d="M8 38 C32 6, 44 11, 32 36 C56 10, 72 17, 52 42 C82 30, 98 22, 136 35"
              fill="none"
              stroke="#0b2b65"
              strokeLinecap="round"
              strokeWidth="2.4"
            />
          </svg>
          <div className="border-t border-[#9eb3d2] pt-2 text-[10px] font-bold sm:pt-3 sm:text-[13px] text-[#243b69]">
            Tunai Trust Authority
          </div>
        </div>
        <QrCode />
      </div>
    </article>
  );
}

function CertificateRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-5">
      <span className="text-[#526991]">{label}</span>
      <span
        className={cn(
          "max-w-[210px] break-all text-right sm:max-w-none",
          strong
            ? "font-extrabold text-blue-600"
            : "font-extrabold text-[#071b4d]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function CertificateStamp() {
  return (
    <div className="grid justify-items-center">
      <div className="grid size-[76px] place-items-center sm:size-[100px] rounded-full border-2 border-[#8798b4] text-[#526991]">
        <div className="grid size-[54px] place-items-center sm:size-[72px] rounded-full border border-[#a5b4cc] text-center">
          <ShieldCheck className="size-7 sm:size-9" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-2 text-[10px] font-extrabold sm:text-[12px] uppercase tracking-[0.12em] text-[#526991]">
        Verified
      </div>
    </div>
  );
}

function QrCode() {
  const cells = Array.from({ length: 49 }, (_, index) => index);

  return (
    <div
      className="ml-auto grid size-[66px] grid-cols-7 gap-1 rounded bg-white p-1.5 shadow-sm sm:size-[86px] sm:p-2"
      aria-hidden="true"
    >
      {cells.map((cell) => (
        <span
          key={cell}
          className={cn(
            "rounded-[1px]",
            [
              0, 1, 2, 7, 14, 15, 16, 4, 5, 6, 11, 13, 18, 20, 24, 25, 27, 30,
              32, 35, 36, 41, 42, 44, 45, 46, 48,
            ].includes(cell)
              ? "bg-[#071b4d]"
              : "bg-blue-100",
          )}
        />
      ))}
    </div>
  );
}

function DashboardPreviewSection() {
  return (
    <section id="dashboard" className="px-2 pb-16 pt-4 sm:px-4 sm:pb-[94px]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 rounded-xl border border-[#dce8f7] bg-white px-4 py-7 shadow-[0_18px_46px_rgba(11,27,77,0.055)] sm:px-8 sm:py-10 xl:min-h-[1078px] xl:grid-cols-[350px_minmax(0,1fr)] xl:py-0">
        <div>
          <EyebrowPill icon={Sparkles}>DASHBOARD PREVIEW</EyebrowPill>
          <h2 className="mt-7 text-[38px] font-extrabold leading-[1.16] tracking-[-0.02em] text-[#061747] sm:mt-8 sm:text-[44px]">
            Real-time visibility. Total control.
          </h2>
          <p className="mt-6 text-[19px] font-medium leading-8 text-[#526991]">
            Tunai&apos;s unified dashboard gives you complete visibility into
            identities, access events, and risks across your environment—so you
            can act with speed and confidence.
          </p>
          <div className="mt-11 space-y-9">
            {dashboardFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-5">
                <IconTile
                  icon={feature.icon}
                  className="size-12 rounded-full"
                />
                <div>
                  <h3 className="text-[16px] font-extrabold">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[16px] font-medium leading-7 text-[#526991]">
                    {feature.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="#dashboard"
            className="mt-12 inline-flex items-center gap-3 text-[18px] font-bold text-blue-600"
          >
            Explore the Dashboard
            <ArrowRight className="size-5" aria-hidden="true" />
          </a>
        </div>
        <div className="max-w-full overflow-x-auto overscroll-x-contain rounded-xl pb-2 pt-2 sm:py-8">
          <DashboardMockup />
          <p className="mt-3 text-center text-[12px] font-semibold text-[#7889a9] xl:hidden">
            Swipe horizontally to inspect the full dashboard preview.
          </p>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="grid min-h-[885px] min-w-[980px] grid-cols-[180px_1fr] overflow-hidden rounded-xl border border-[#dce8f7] bg-[#f7faff] shadow-[0_18px_48px_rgba(11,27,77,0.06)]">
      <aside className="border-r border-[#dce8f7] bg-white px-4 py-6">
        <BrandLogo className="gap-3 [&_span:last-child]:text-[15px]" />
        <MockNav />
      </aside>
      <div className="min-w-0">
        <MockTopBar />
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-5 gap-3">
            {mockMetrics.map((metric) => (
              <MockMetricCard key={metric.label} {...metric} />
            ))}
          </div>
          <div className="grid grid-cols-[1fr_240px] gap-3">
            <LiveAccessTable />
            <PendingReviews />
          </div>
          <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.9fr] gap-3">
            <RiskMapPreview />
            <RiskListPanel title="TOP RISKY IPs" />
            <RiskListPanel title="TOP RISKY ASNs" />
            <InsightsPanel />
          </div>
          <div className="grid grid-cols-[1fr_1.35fr_1fr] gap-3">
            <StatusPanel title="SYSTEM STATUS" body="All Systems Operational" />
            <StatusPanel
              title="CERTIFICATE HEALTH"
              body="Good 84%   Warning 12%   Critical 4%"
            />
            <StatusPanel
              title="WEBHOOK DELIVERY HEALTH"
              body="98.7% success   21 failures   312 ms avg."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockNav() {
  const groups = [
    ["COMMAND CENTER", "Command Center"],
    [
      "INTELLIGENCE",
      "Identities",
      "Organizations",
      "Devices",
      "IP Records",
      "Certificates",
      "Aliases",
    ],
    [
      "OPERATIONS",
      "Access Events",
      "Behavioral Events",
      "Trust Signals",
      "Webhook Logs",
      "Pending Reviews",
    ],
    [
      "RISK & ANALYSIS",
      "Risk Explorer",
      "Threat Intelligence",
      "Attack Surface",
    ],
  ];

  return (
    <nav className="mt-8 space-y-5">
      {groups.map(([label, ...items]) => (
        <div key={label}>
          <div className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#7889a9]">
            {label}
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-md px-2 text-[11px] font-bold text-[#071b4d]",
                  (item === "Command Center" || item === "Access Events") &&
                    "bg-[#eaf3ff] text-blue-600",
                )}
              >
                <span className="size-3 rounded-sm border border-current" />
                <span>{item}</span>
                {item === "Pending Reviews" ? (
                  <span className="ml-auto rounded bg-blue-50 px-1.5 text-[9px] text-blue-600">
                    12
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-14 text-[11px] font-bold text-[#607196]">
        N Collapse
      </div>
    </nav>
  );
}

function MockTopBar() {
  return (
    <header className="flex h-[70px] items-center gap-3 border-b border-[#dce8f7] bg-white px-4">
      <div className="relative h-9 flex-1 max-w-[330px]">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#7889a9]"
          aria-hidden="true"
        />
        <div className="h-full rounded-md border border-[#dce8f7] bg-white pl-9 pt-2 text-[11px] font-semibold text-[#8a98b2]">
          Search identities, IPs, orgs, certificates...
        </div>
      </div>
      <div className="ml-auto flex h-9 w-[140px] items-center gap-2 rounded-md border border-[#dce8f7] bg-white px-3 text-[11px] font-bold">
        <KeyRound className="size-3 text-blue-600" aria-hidden="true" />
        Acme Corp
        <ChevronDown className="ml-auto size-3" aria-hidden="true" />
      </div>
      <CircleHelp className="size-4 text-[#607196]" aria-hidden="true" />
      <div className="grid size-8 place-items-center rounded-full bg-[#ffe1d7] text-[11px] font-extrabold text-[#7c2d12]">
        AM
      </div>
      <div className="text-[11px] font-bold leading-tight">
        Alex Morgan
        <br />
        <span className="text-[9px] text-[#607196]">Security Admin</span>
      </div>
    </header>
  );
}

function MockMetricCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
}: (typeof mockMetrics)[number]) {
  return (
    <article className="min-h-[86px] rounded-lg border border-[#dce8f7] bg-white p-3 shadow-[0_8px_20px_rgba(11,27,77,0.035)]">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-extrabold text-[#243b69]">{label}</div>
        <Icon
          className={cn(
            "size-5",
            tone === "red" ? "text-red-500" : "text-blue-600",
          )}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 text-[22px] font-extrabold">{value}</div>
      <div
        className={cn(
          "mt-1 text-[10px] font-bold",
          tone === "red" ? "text-red-500" : "text-emerald-600",
        )}
      >
        + {delta} <span className="text-[#607196]">vs 24h ago</span>
      </div>
    </article>
  );
}

function LiveAccessTable() {
  return (
    <section className="rounded-lg border border-[#dce8f7] bg-white shadow-[0_8px_20px_rgba(11,27,77,0.035)]">
      <div className="flex h-12 items-center gap-3 border-b border-[#dce8f7] px-4">
        <h3 className="text-[12px] font-extrabold">LIVE ACCESS EVENTS</h3>
        <span className="flex items-center gap-1 text-[10px] font-bold text-[#607196]">
          <span className="size-2 rounded-full bg-emerald-500" /> Streaming
        </span>
        <div className="ml-auto flex gap-2">
          <button className="h-8 rounded-md border border-[#dce8f7] px-3 text-[10px] font-bold">
            All Events
          </button>
          <button className="inline-flex h-8 items-center gap-1 rounded-md border border-[#dce8f7] px-3 text-[10px] font-bold">
            <Filter className="size-3" /> Filters (3)
          </button>
          <button
            className="grid size-8 place-items-center rounded-md border border-[#dce8f7]"
            aria-label="More"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
      <table className="w-full text-left text-[10px] font-semibold">
        <thead className="h-8 border-b border-[#dce8f7] text-[9px] uppercase text-[#607196]">
          <tr>
            {[
              "Time",
              "Identity",
              "IP Address",
              "Action",
              "Risk Level",
              "Trust Score",
              "Location",
              "Device / Client",
            ].map((head) => (
              <th key={head} className="px-2">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockEvents.map((event) => (
            <tr
              key={event.join("-")}
              className="h-[38px] border-b border-[#edf2f8]"
            >
              {event.map((cell, index) => (
                <td
                  key={`${cell}-${index}`}
                  className={cn(
                    "px-2",
                    index === 1 || index === 2 ? "text-blue-600" : "",
                    index === 4 ? riskText(cell) : "",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex h-10 items-center px-4 text-[10px] font-semibold text-[#607196]">
        Showing 1 to 6 of 25,833 events
        <span className="ml-auto text-blue-600">View all events &gt;</span>
      </div>
    </section>
  );
}

function PendingReviews() {
  return (
    <section className="rounded-lg border border-[#dce8f7] bg-white">
      <div className="flex h-12 items-center px-4 text-[12px] font-extrabold">
        PENDING REVIEWS{" "}
        <span className="ml-auto rounded bg-blue-50 px-2 py-1 text-[10px] text-blue-600">
          12
        </span>
      </div>
      {pendingReviews.map(([title, meta, time, level]) => (
        <article
          key={title}
          className="grid grid-cols-[24px_1fr_auto] gap-2 border-t border-[#edf2f8] px-3 py-2"
        >
          <span
            className={cn(
              "mt-1 grid size-5 place-items-center rounded-full text-[10px]",
              level === "critical"
                ? "bg-red-50 text-red-500"
                : "bg-amber-50 text-amber-500",
            )}
          >
            !
          </span>
          <div className="min-w-0">
            <div className="truncate text-[10px] font-extrabold">{title}</div>
            <div className="truncate text-[9px] font-semibold text-[#607196]">
              {meta}
            </div>
          </div>
          <span className="text-[9px] font-semibold text-[#607196]">
            {time}
          </span>
        </article>
      ))}
      <div className="px-4 py-3 text-[10px] font-bold text-blue-600">
        View all pending reviews &gt;
      </div>
    </section>
  );
}

function RiskMapPreview() {
  const points = [
    [60, 45, "bg-blue-600"],
    [126, 90, "bg-amber-500"],
    [204, 68, "bg-red-500"],
    [262, 115, "bg-amber-500"],
    [170, 132, "bg-red-500"],
  ] as const;

  return (
    <section className="rounded-lg border border-[#dce8f7] bg-white p-3">
      <h3 className="text-[11px] font-extrabold">
        THREAT ORIGINS / GEOGRAPHIC RISK ACTIVITY
      </h3>
      <div className="relative mt-3 h-[170px] overflow-hidden rounded-md bg-[#f6f9fe]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 320 170"
          aria-hidden="true"
        >
          <g fill="#dbe7f5" opacity=".9">
            <path d="M24 53 40 37l24-8 17 4 11 13-13 8-14 18-17 8-11-10-19-4Z" />
            <path d="m80 80 21 7 10 19-5 27-15 17-8-20-12-19Z" />
            <path d="m128 42 19-11 36 3 17 14 22 2 25 13-9 12-22-5-16 12-24-8-17 3-20-18Z" />
            <path d="m165 84 18 1 15 13-1 30-14 18-12-18-16-11Z" />
            <path d="m232 102 16-9 21 5 13 12-14 12-23-3Z" />
          </g>
          <path
            d="M205 67 Q140 14 62 45 M205 67 Q238 35 262 115"
            fill="none"
            stroke="#ef4444"
            strokeDasharray="3 4"
          />
        </svg>
        {points.map(([left, top, color]) => (
          <span
            key={`${left}-${top}`}
            className={cn(
              "absolute size-2 rounded-full ring-4 ring-current/15",
              color,
            )}
            style={{ left, top }}
          />
        ))}
        <div className="absolute bottom-8 right-7 w-[124px] rounded-md border border-[#dce8f7] bg-white p-3 text-[9px] font-semibold shadow-lg">
          <div className="text-[11px] font-extrabold">Moscow, RU</div>
          <div className="mt-2 grid grid-cols-2 gap-y-1 text-[#607196]">
            <span>Risk Level</span>
            <span className="text-red-500">High</span>
            <span>Events</span>
            <span className="text-[#071b4d]">1,283</span>
            <span>Coordinate</span>
            <span className="text-[#071b4d]">55.76, 37.62</span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-[10px] font-bold text-blue-600">
        View full geo analysis &gt;
      </div>
    </section>
  );
}

function RiskListPanel({ title }: { title: string }) {
  return (
    <section className="rounded-lg border border-[#dce8f7] bg-white p-3">
      <h3 className="text-[11px] font-extrabold">{title}</h3>
      <table className="mt-3 w-full text-left text-[9px] font-bold">
        <thead className="uppercase text-[#607196]">
          <tr>
            <th className="pb-2">IP Address</th>
            <th className="pb-2">Risk Score</th>
            <th className="pb-2 text-right">Events</th>
          </tr>
        </thead>
        <tbody>
          {riskRows.map(([ip, score, events]) => (
            <tr key={ip} className="border-t border-[#edf2f8]">
              <td className="py-2 text-blue-600">{ip}</td>
              <td
                className={cn(
                  "py-2",
                  score.includes("Critical") || score.includes("High")
                    ? "text-red-500"
                    : "text-amber-500",
                )}
              >
                {score}
              </td>
              <td className="py-2 text-right">{events}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-[10px] font-bold text-blue-600">
        View all risky IPs &gt;
      </div>
    </section>
  );
}

function InsightsPanel() {
  return (
    <section className="rounded-lg border border-[#dce8f7] bg-white p-3">
      <div className="flex items-center gap-2 text-[11px] font-extrabold">
        <Sparkles className="size-4 text-blue-600" />
        AI INSIGHTS
        <span className="ml-auto rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-600">
          BETA
        </span>
      </div>
      <ul className="mt-3 space-y-3 text-[10px] font-semibold leading-4 text-[#526991]">
        <li>
          Identity risk for account: contractor.user is elevated from unusual
          authentication patterns observed.
        </li>
        <li>2 Critical sign-ins require immediate attention</li>
        <li>5 identities show anomalous behavior</li>
        <li>10 risky events in the last 24h</li>
      </ul>
      <div className="mt-7 text-[10px] font-bold text-blue-600">
        View all insights &gt;
      </div>
    </section>
  );
}

function StatusPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-lg border border-[#dce8f7] bg-white p-4">
      <h3 className="text-[11px] font-extrabold">{title}</h3>
      <div className="mt-3 text-[12px] font-bold text-emerald-600">{body}</div>
    </section>
  );
}

function riskText(cell: string) {
  if (cell === "CRITICAL" || cell === "HIGH") return "text-red-500";
  if (cell === "MEDIUM") return "text-amber-500";
  return "text-emerald-600";
}

function UseCasesSection() {
  return (
    <section
      id="use-cases"
      className="px-4 pb-16 pt-8 sm:px-5 sm:pb-[86px] sm:pt-9"
    >
      <div className="mx-auto max-w-[1208px] text-center">
        <EyebrowPill icon={Code2}>Use Cases</EyebrowPill>
        <h2 className="mx-auto mt-4 max-w-[840px] text-[38px] font-extrabold leading-[1.14] tracking-[-0.02em] text-[#061747] sm:text-[48px] lg:text-[56px]">
          Designed for platforms where{" "}
          <span className="text-blue-600">trust affects growth.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[670px] text-[19px] font-medium leading-8 text-[#526991]">
          Tunai helps modern platforms verify real users, prevent abuse, and
          build trust—without adding friction.
        </p>
        <div className="mt-7 grid gap-6 text-left lg:grid-cols-[1fr_1fr]">
          <FeaturedUseCase />
          <div className="space-y-4">
            {useCases.map((useCase) => (
              <UseCaseCompactCard key={useCase.title} {...useCase} />
            ))}
          </div>
        </div>
      </div>
      <TrustedPartnersStrip className="mt-8" compact />
    </section>
  );
}

function FeaturedUseCase() {
  return (
    <article className="min-h-[520px] rounded-xl border border-blue-300 bg-white p-5 sm:min-h-[560px] sm:p-7 shadow-[0_12px_34px_rgba(11,27,77,0.045)]">
      <div className="flex items-start gap-4 sm:gap-7">
        <IconTile icon={Code2} className="size-14 rounded-full sm:size-16" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-[22px] font-extrabold text-blue-600">
              API Platforms
            </h3>
            <StatusPill tone="green" className="ml-auto">
              Active
            </StatusPill>
          </div>
          <p className="mt-4 max-w-[440px] text-[21px] sm:text-[25px] font-extrabold leading-[1.32]">
            Prevent repeated free-tier abuse and protect your infrastructure.
          </p>
        </div>
      </div>
      <div className="my-7 h-px bg-[#dce8f7]" />
      <div className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-blue-600">
        Scenario
      </div>
      <p className="mt-4 text-[16px] font-medium leading-7 text-[#526991]">
        Attackers create unlimited accounts to abuse free tiers, drain quotas,
        and inflate usage.
      </p>
      <div className="mt-7 text-[12px] font-extrabold uppercase tracking-[0.08em] text-blue-600">
        Tunai Response
      </div>
      <div className="mt-4 space-y-4">
        {featuredUseCaseItems.map((item) => (
          <div key={item.title} className="flex gap-5">
            <IconTile icon={item.icon} className="size-11 rounded-lg" />
            <div>
              <div className="text-[14px] font-extrabold">{item.title}</div>
              <div className="mt-1 text-[13px] font-medium text-[#526991]">
                {item.body}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-7">
        <SecondaryButton className="h-[50px] px-6">
          Explore API Security
        </SecondaryButton>
        <ExternalTextLink>View documentation</ExternalTextLink>
      </div>
    </article>
  );
}

function UseCaseCompactCard({
  title,
  body,
  badge,
  icon,
}: {
  title: string;
  body: string;
  badge: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <article className="relative flex min-h-[126px] items-start gap-4 rounded-xl border border-[#dce8f7] bg-white p-5 sm:items-center sm:gap-7 sm:p-7 shadow-[0_12px_28px_rgba(11,27,77,0.035)]">
      <IconTile icon={icon} className="size-12 rounded-full sm:size-16" />
      <div className="min-w-0 flex-1">
        <h3 className="pr-16 text-[19px] font-extrabold sm:pr-0 sm:text-[22px]">
          {title}
        </h3>
        <p className="mt-2 max-w-[390px] text-[16px] font-medium leading-7 text-[#526991]">
          {body}
        </p>
      </div>
      <StatusPill
        tone={badge === "Trusted" ? "green" : "blue"}
        className="absolute right-4 top-4 sm:static"
      >
        {badge}
      </StatusPill>
    </article>
  );
}

function DeveloperIntegrationSection() {
  return (
    <section id="developers" className="px-4 pt-4 sm:px-5 sm:pt-6">
      <div className="mx-auto grid max-w-[1404px] gap-8 rounded-xl border border-[#dce8f7] bg-white p-4 shadow-[0_14px_34px_rgba(11,27,77,0.045)] sm:p-8 lg:grid-cols-[1fr_565px] lg:gap-12">
        <div>
          <EyebrowPill icon={Code2}>DEVELOPER INTEGRATION</EyebrowPill>
          <h2 className="mt-6 max-w-[610px] text-[38px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#061747] sm:text-[44px]">
            Add trust intelligence where your platform needs it.
          </h2>
          <p className="mt-4 max-w-[610px] text-[18px] font-medium leading-8 text-[#526991]">
            Tunai&apos;s API delivers real-time evaluations and actionable trust
            signals so you can make confident access decisions across your
            workflows.
          </p>
          <TrustFlowDiagram />
        </div>
        <CodeExamplePanel />
      </div>
    </section>
  );
}

function TrustFlowDiagram() {
  return (
    <div className="mt-7 grid gap-5 rounded-lg border border-[#dce8f7] bg-white p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
      {integrationSteps.map((step, index) => (
        <div key={step.title} className="relative">
          <IconTile
            icon={step.icon}
            tone={
              step.tone === "green"
                ? "green"
                : step.tone === "amber"
                  ? "amber"
                  : "blue"
            }
            className="size-14"
          />
          {index < integrationSteps.length - 1 ? (
            <span className="absolute left-[70px] top-7 hidden w-[66px] border-t-2 border-dashed border-[#72a8ff] xl:block">
              <ArrowRight
                className="absolute -right-2 -top-[9px] size-4 text-blue-600"
                aria-hidden="true"
              />
            </span>
          ) : null}
          <div className="mt-4 text-[12px] font-extrabold">{step.title}</div>
          <div className="mt-2 max-w-[120px] text-[12px] font-medium leading-5 text-[#526991]">
            {step.body}
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeExamplePanel() {
  return (
    <article className="overflow-hidden rounded-lg border border-[#dce8f7] bg-white shadow-[0_12px_30px_rgba(11,27,77,0.035)]">
      <div className="flex h-[60px] items-center border-b border-[#dce8f7] px-3 sm:px-5">
        <span className="grid size-7 place-items-center rounded bg-blue-600 text-[12px] font-extrabold text-white">
          TS
        </span>
        <span className="ml-3 text-[15px] font-extrabold">TypeScript</span>
        <SecondaryButton className="ml-auto hidden h-9 px-4 text-[12px] sm:inline-flex">
          View API Reference
        </SecondaryButton>
      </div>
      <pre className="overflow-x-auto px-3 py-4 text-[11px] sm:px-5 sm:text-[12px] font-semibold leading-[1.42] text-[#1d3563]">
        {codeLines.map((line, index) => (
          <code
            key={`${index}-${line}`}
            className="grid grid-cols-[28px_1fr] gap-5"
          >
            <span className="select-none text-right text-[#9aa9c4]">
              {index + 1}
            </span>
            <span>{syntaxLine(line)}</span>
          </code>
        ))}
      </pre>
      <div className="grid min-h-[60px] items-center gap-4 border-t border-[#dce8f7] bg-[#f7faff] px-5 py-3 text-[14px] font-semibold text-[#526991] sm:grid-cols-[100px_1fr_1fr_1fr]">
        <StatusPill tone="green">200 OK</StatusPill>
        <span>
          Trust Score: <strong className="text-[#071b4d]">78/100</strong>
        </span>
        <span>
          Decision: <strong className="text-emerald-600">Allow</strong>
        </span>
        <span>
          Risk Level: <strong className="text-emerald-600">Low</strong>
        </span>
      </div>
    </article>
  );
}

function syntaxLine(line: string) {
  if (line.startsWith("import"))
    return <span className="text-purple-600">{line}</span>;
  if (line.includes("const") || line.includes("await"))
    return <span className="text-blue-600">{line}</span>;
  if (line.includes("'"))
    return <span className="text-emerald-700">{line}</span>;
  return line;
}

function FinalCTASection() {
  return (
    <section id="demo" className="px-4 py-5 sm:px-5 sm:py-6">
      <div className="relative mx-auto grid min-h-[210px] max-w-[1404px] gap-7 overflow-hidden rounded-xl border border-[#cfe0f7] bg-[#eef6ff] px-5 py-8 shadow-[0_12px_32px_rgba(11,27,77,0.045)] sm:px-8 sm:py-10 lg:grid-cols-[1fr_1px_1fr_240px] lg:gap-0 lg:px-10 lg:py-12">
        <div className="absolute -bottom-12 left-0 h-32 w-[520px] opacity-50 [background-image:radial-gradient(#80b4ff_1px,transparent_1px)] [background-size:10px_10px]" />
        <h2 className="relative max-w-[520px] text-[34px] font-extrabold leading-[1.22] tracking-[-0.02em] text-[#061747] sm:text-[40px] sm:leading-[1.28]">
          Build a safer platform with a smarter trust layer.
        </h2>
        <div className="relative hidden w-px bg-[#bfcfe8] lg:block" />
        <div className="relative flex flex-col justify-center gap-6 lg:px-10">
          <p className="max-w-[420px] text-[17px] font-medium leading-7 text-[#526991]">
            Join leading teams using Tunai to stop risk before it becomes an
            incident.
          </p>
          <div className="flex flex-wrap gap-5">
            <PrimaryButton className="h-11 w-full sm:w-auto">
              Request a Demo
            </PrimaryButton>
            <SecondaryButton icon={FileText} className="h-11 w-full sm:w-auto">
              View Developer Docs
            </SecondaryButton>
          </div>
        </div>
        <div className="relative hidden place-items-center lg:grid">
          <svg
            className="size-[170px]"
            viewBox="0 0 170 170"
            aria-hidden="true"
          >
            {[42, 58, 74].map((r) => (
              <circle
                key={r}
                cx="85"
                cy="85"
                r={r}
                fill="none"
                stroke="#9fc5ff"
                strokeDasharray="4 5"
              />
            ))}
            <ShieldCheck
              x="59"
              y="55"
              width="52"
              height="52"
              color="#8bb9ff"
              opacity=".65"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="px-4 pb-4 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-[1404px] rounded-xl border border-[#dce8f7] bg-white px-5 py-7 sm:px-8 lg:px-12 lg:py-8 shadow-[0_12px_32px_rgba(11,27,77,0.045)]">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <BrandLogo />
            <p className="mt-6 max-w-[250px] text-[15px] font-medium leading-7 text-[#526991]">
              AI-native identity trust and access security for modern platforms.
            </p>
            <SocialLinks />
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map(([title, ...links]) => (
              <div key={title}>
                <h3 className="mb-5 text-[12px] font-extrabold tracking-[0.08em]">
                  {title}
                </h3>
                <ul className="space-y-4 text-[14px] font-medium text-[#526991]">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#dce8f7] pt-5 text-[13px] font-medium text-[#526991]">
          <span>© 2024 Tunai, Inc. All rights reserved.</span>
          <span className="ml-auto inline-flex items-center gap-2">
            Made with{" "}
            <Heart className="size-4 text-blue-600" aria-hidden="true" /> in San
            Francisco
          </span>
        </div>
      </div>
    </footer>
  );
}
