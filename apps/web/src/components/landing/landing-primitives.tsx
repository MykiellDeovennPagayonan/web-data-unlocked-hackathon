import {
  ArrowRight,
  Check,
  Cloud,
  ExternalLink,
  Building2,
  GitBranch,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DecisionTone } from "./landing-data";
import { partners } from "./landing-data";

export function BrandLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <a
      href="#top"
      className={cn(
        "inline-flex items-center gap-4 text-[#071b4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className,
      )}
      aria-label="Tunai home"
    >
      <span className="grid size-10 place-items-center text-blue-600">
        <ShieldCheck className="size-10 stroke-[2.2]" aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="text-[24px] font-extrabold tracking-[0.22em]">TUNAI</span>
      ) : null}
    </a>
  );
}

export function EyebrowPill({
  icon: Icon = ShieldCheck,
  children,
  className,
}: {
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center gap-3 rounded-lg bg-[#eaf3ff] px-4 text-[14px] font-bold text-blue-600 shadow-[inset_0_0_0_1px_rgba(11,111,246,0.03)]",
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function PrimaryButton({
  children,
  href = "#demo",
  className,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-[52px] items-center justify-center gap-3 rounded-md bg-blue-600 px-7 text-[15px] font-bold text-white shadow-[0_12px_26px_rgba(11,111,246,0.22)] transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
      <ArrowRight className="size-5" aria-hidden="true" />
    </a>
  );
}

export function SecondaryButton({
  children,
  href = "#how-it-works",
  icon: Icon,
  className,
}: {
  children: ReactNode;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex h-[52px] items-center justify-center gap-3 rounded-md border border-[#cfdcf0] bg-white px-7 text-[15px] font-bold text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        className,
      )}
    >
      {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
      {children}
    </a>
  );
}

export function IconTile({
  icon: Icon,
  tone = "blue",
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
  className?: string;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-500",
    red: "bg-red-50 text-red-500",
    slate: "bg-slate-50 text-slate-500",
  };

  return (
    <span className={cn("grid size-12 shrink-0 place-items-center rounded-lg", tones[tone], className)}>
      <Icon className="size-6 stroke-[2.1]" aria-hidden="true" />
    </span>
  );
}

export function StatusPill({
  children,
  tone = "blue",
  className,
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
  className?: string;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-bold", tones[tone], className)}>
      {tone === "green" ? <span className="size-2 rounded-full bg-emerald-500" /> : null}
      {children}
    </span>
  );
}

export function TrustScoreRing({
  value = 78,
  size = 78,
  className,
}: {
  value?: number;
  size?: number;
  className?: string;
}) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const viewBox = 82;

  return (
    <span className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`} aria-hidden="true">
        <circle cx="41" cy="41" r={radius} fill="none" stroke="#e8f0fb" strokeWidth="9" />
        <circle
          cx="41"
          cy="41"
          r={radius}
          fill="none"
          stroke="#0b6ff6"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="8.5"
        />
      </svg>
      <span className="text-center text-[22px] font-extrabold leading-none text-[#071b4d]">{value}</span>
    </span>
  );
}

export function DecisionCard({
  label,
  detail,
  subdetail,
  tone,
  icon: Icon,
  className,
}: {
  label: string;
  detail: string;
  subdetail: string;
  tone: DecisionTone;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}) {
  const styles: Record<DecisionTone, string> = {
    allow: "border-emerald-300 bg-emerald-50/40 text-emerald-600",
    verify: "border-blue-300 bg-blue-50/35 text-blue-600",
    review: "border-amber-300 bg-amber-50/35 text-amber-500",
    limit: "border-orange-300 bg-orange-50/40 text-orange-500",
    block: "border-red-300 bg-red-50/40 text-red-500",
  };

  return (
    <article
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-white px-5 py-4 shadow-[0_8px_24px_rgba(11,27,77,0.035)]",
        styles[tone],
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-current/10">
        <Icon className="size-6 stroke-[2.2]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-extrabold text-[#071b4d]">{label}</span>
        <span className="mt-1 block text-[12px] font-medium leading-5 text-[#465d8b]">{detail}</span>
        <span className="block text-[12px] font-medium leading-5 text-[#465d8b]">{subdetail}</span>
      </span>
    </article>
  );
}

export function TrustedPartnersStrip({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-[1320px] items-center rounded-xl border border-[#dce8f7] bg-white shadow-[0_14px_38px_rgba(11,27,77,0.05)]",
        compact ? "min-h-[114px] px-7" : "min-h-[116px] px-7",
        className,
      )}
      aria-label="Trusted partners"
    >
      <div className="flex min-w-[270px] items-center gap-5 pr-8 text-[14px] font-bold leading-6 text-[#243b69]">
        <span className="grid size-12 place-items-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <span>Trusted by security and engineering teams worldwide</span>
      </div>
      <div className="h-14 w-px bg-[#dce8f7]" />
      <div className="grid flex-1 grid-cols-2 items-center gap-x-9 gap-y-5 pl-9 text-[#73809c] sm:grid-cols-3 lg:grid-cols-6">
        {partners.map((partner) => (
          <PartnerLogo key={partner} label={partner} />
        ))}
      </div>
    </section>
  );
}

export function PartnerLogo({ label }: { label: string }) {
  if (label === "Microsoft") {
    return (
      <span className="inline-flex items-center gap-3 text-[23px] font-semibold">
        <span className="grid size-7 grid-cols-2 gap-0.5">
          <span className="bg-[#7d8da8]" />
          <span className="bg-[#7d8da8]" />
          <span className="bg-[#7d8da8]" />
          <span className="bg-[#7d8da8]" />
        </span>
        Microsoft
      </span>
    );
  }

  if (label === "aws") {
    return (
      <span className="relative inline-flex w-fit flex-col text-[28px] font-semibold leading-none">
        aws
        <span className="mt-1 h-2 w-14 rounded-[50%] border-b-2 border-[#7d8da8]" />
      </span>
    );
  }

  if (label === "Google Cloud") {
    return (
      <span className="inline-flex items-center gap-2 text-[20px] font-semibold">
        <Cloud className="size-7 fill-[#7d8da8]/10 stroke-[2.3]" aria-hidden="true" />
        Google Cloud
      </span>
    );
  }

  if (label === "okta") {
    return <span className="text-[26px] font-bold lowercase">{label}</span>;
  }

  if (label === "Cloudflare") {
    return (
      <span className="inline-flex flex-col items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.22em]">
        <Cloud className="size-10 fill-[#7d8da8]/20 stroke-0" aria-hidden="true" />
        Cloudflare
      </span>
    );
  }

  return <span className="text-[27px] font-extrabold">{label}</span>;
}

export function MiniEcosystemLogo({ label }: { label: string }) {
  return (
    <div className="grid size-[74px] place-items-center rounded-lg border border-[#dce8f7] bg-white text-center text-[19px] font-extrabold text-[#071b4d] shadow-[0_10px_24px_rgba(11,27,77,0.045)]">
      {label}
    </div>
  );
}

export function SectionTrustNote() {
  return (
    <div className="mt-10 flex items-center justify-center gap-5 text-[16px] font-semibold text-[#607196]">
      <ShieldCheck className="size-7 text-blue-600" aria-hidden="true" />
      <span>Trusted by security and engineering teams worldwide</span>
    </div>
  );
}

export function SocialLinks() {
  const socials = [
    { label: "GitHub", icon: GitBranch },
    { label: "LinkedIn", icon: Building2 },
    { label: "X", icon: X },
    { label: "Email", icon: Mail },
  ];

  return (
    <div className="mt-6 flex gap-3">
      {socials.map(({ label, icon: Icon }) => (
        <a
          key={label}
          href="#"
          aria-label={label}
          className="grid size-10 place-items-center rounded-lg border border-[#dce8f7] bg-white text-[#526485] transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Icon className="size-5" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export function ExternalTextLink({ children, href = "#" }: { children: ReactNode; href?: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 text-[15px] font-bold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {children}
      <ExternalLink className="size-4" aria-hidden="true" />
    </a>
  );
}

export function TinyCheck() {
  return (
    <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-emerald-600">
      <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />
    </span>
  );
}
