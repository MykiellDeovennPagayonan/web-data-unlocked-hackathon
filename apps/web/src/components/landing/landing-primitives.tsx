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

export function BrandLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href="#top"
      className={cn(
        "inline-flex items-center gap-4 text-[#071b4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className,
      )}
      aria-label="Tunai home"
    >
      <img
        src="/TunAI_Logo_Final.png"
        alt=""
        className="h-11 w-auto sm:h-14"
        aria-hidden="true"
      />
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
        "inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg bg-[#eaf3ff] px-3 py-2 text-[12px] font-bold text-blue-600 sm:gap-3 sm:px-4 sm:text-[14px] shadow-[inset_0_0_0_1px_rgba(11,111,246,0.03)]",
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
        "inline-flex h-[52px] items-center justify-center gap-3 rounded-md bg-blue-600 px-6 text-[14px] sm:px-7 sm:text-[15px] font-bold text-white shadow-[0_12px_26px_rgba(11,111,246,0.22)] transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
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
        "inline-flex h-[52px] items-center justify-center gap-3 rounded-md border border-[#cfdcf0] bg-white px-6 text-[14px] sm:px-7 sm:text-[15px] font-bold text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
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
    <span
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-lg",
        tones[tone],
        className,
      )}
    >
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-bold",
        tones[tone],
        className,
      )}
    >
      {tone === "green" ? (
        <span className="size-2 rounded-full bg-emerald-500" />
      ) : null}
      {children}
    </span>
  );
}

export function TrustScoreRing({
  value = 78,
  size = 78,
  showValue = true,
  className,
}: {
  value?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * circumference;
  const viewBox = 82;

  return (
    <span
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        aria-hidden="true"
      >
        <circle
          cx="41"
          cy="41"
          r={radius}
          fill="none"
          stroke="#e8f0fb"
          strokeWidth="9"
        />
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
      {showValue ? (
        <span className="text-center text-[22px] font-extrabold leading-none text-[#071b4d]">
          {value}
        </span>
      ) : null}
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
  const cardBorder: Record<DecisionTone, string> = {
    allow: "border border-[#bbf7d0]",
    verify: "border border-[#bfdbfe]",
    review: "border border-[#fde68a]",
    limit: "border border-[#fed7aa]",
    block: "border border-[#fecaca]",
  };

  const cardBg: Record<DecisionTone, string> = {
    allow: "",
    verify: "",
    review: "",
    limit: "",
    block: "",
  };

  const iconBg: Record<DecisionTone, string> = {
    allow: "bg-emerald-50 text-emerald-600",
    verify: "bg-blue-50 text-blue-600",
    review: "bg-amber-50 text-amber-500",
    limit: "bg-orange-50 text-orange-500",
    block: "bg-red-50 text-red-500",
  };

  return (
    <article
      className={cn(
        "flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-[0_8px_24px_rgba(11,27,77,0.035)]",
        cardBorder[tone],
        cardBg[tone],
        className,
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full",
          iconBg[tone],
        )}
      >
        <Icon className="size-5 stroke-[2.2]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-extrabold text-[#071b4d]">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] font-medium leading-[1.35] text-[#465d8b]">
          {detail}
        </span>
        <span className="block text-[11px] font-medium leading-[1.35] text-[#465d8b]">
          {subdetail}
        </span>
      </span>
    </article>
  );
}

export function TrustedPartnersStrip({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "mx-auto flex w-full max-w-[1320px] flex-col items-stretch rounded-xl border border-[#dce8f7] bg-white shadow-[0_14px_38px_rgba(11,27,77,0.05)] sm:flex-row sm:items-center",
        compact
          ? "min-h-[114px] px-4 py-5 sm:px-7 sm:py-0"
          : "min-h-[116px] px-4 py-5 sm:px-7 sm:py-0",
        className,
      )}
      aria-label="Trusted partners"
    >
      <div className="flex items-center gap-4 pb-4 text-[13px] font-bold leading-5 text-[#243b69] sm:min-w-[270px] sm:gap-5 sm:pb-0 sm:pr-8 sm:text-[14px] sm:leading-6">
        <span className="grid size-12 place-items-center rounded-full bg-blue-50 text-blue-600">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <span>Trusted by security and engineering teams worldwide</span>
      </div>
      <div className="h-px w-full bg-[#dce8f7] sm:h-14 sm:w-px" />
      <div className="grid flex-1 grid-cols-2 items-center gap-x-5 gap-y-5 pt-5 text-[#73809c] sm:grid-cols-3 sm:pl-7 sm:pt-0 lg:grid-cols-6 lg:gap-x-8">
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
      <span className="inline-flex items-center gap-3 text-[17px] font-semibold sm:text-[20px] lg:text-[23px]">
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
      <span className="relative inline-flex w-fit flex-col text-[22px] font-semibold lg:text-[28px] leading-none">
        aws
        <span className="mt-1 h-2 w-14 rounded-[50%] border-b-2 border-[#7d8da8]" />
      </span>
    );
  }

  if (label === "Google Cloud") {
    return (
      <span className="inline-flex items-center gap-2 text-[16px] font-semibold lg:text-[20px]">
        <Cloud
          className="size-7 fill-[#7d8da8]/10 stroke-[2.3]"
          aria-hidden="true"
        />
        Google Cloud
      </span>
    );
  }

  if (label === "okta") {
    return (
      <span className="text-[22px] font-bold lg:text-[26px] lowercase">
        {label}
      </span>
    );
  }

  if (label === "Cloudflare") {
    return (
      <span className="inline-flex flex-col items-center gap-1 text-[11px] font-extrabold uppercase tracking-[0.22em]">
        <Cloud
          className="size-10 fill-[#7d8da8]/20 stroke-0"
          aria-hidden="true"
        />
        Cloudflare
      </span>
    );
  }

  return (
    <span className="text-[22px] font-extrabold lg:text-[27px]">{label}</span>
  );
}

export function MiniEcosystemLogo({ label }: { label: string }) {
  const content = (() => {
    if (label === "aws")
      return (
        <span className="relative text-[20px] font-bold lowercase">
          aws
          <span className="absolute -bottom-1 left-1 h-1.5 w-8 rounded-[50%] border-b-2 border-amber-500" />
        </span>
      );
    if (label === "MS")
      return (
        <span className="grid size-6 grid-cols-2 gap-0.5">
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={index}
              className={cn(
                index === 0
                  ? "bg-orange-500"
                  : index === 1
                    ? "bg-emerald-500"
                    : index === 2
                      ? "bg-blue-500"
                      : "bg-amber-400",
              )}
            />
          ))}
        </span>
      );
    if (label === "G")
      return <span className="text-[21px] font-black text-blue-600">G</span>;
    if (label === "okta")
      return (
        <span className="text-[19px] font-extrabold lowercase text-[#071b4d]">
          okta
        </span>
      );
    if (label === "CF")
      return (
        <Cloud
          className="size-9 fill-orange-400 text-orange-500"
          aria-hidden="true"
        />
      );
    return (
      <span className="text-[14px] font-extrabold text-[#243b69]">{label}</span>
    );
  })();

  return (
    <div className="grid size-[68px] place-items-center rounded-lg border border-[#dce8f7] bg-white text-center shadow-[0_10px_24px_rgba(11,27,77,0.045)] sm:size-[74px]">
      {content}
    </div>
  );
}

export function SectionTrustNote() {
  return (
    <div className="mt-8 flex items-center justify-center gap-3 text-center text-[14px] font-semibold text-[#607196] sm:mt-10 sm:gap-5 sm:text-[16px]">
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

export function ExternalTextLink({
  children,
  href = "#",
}: {
  children: ReactNode;
  href?: string;
}) {
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

export function TinyCheck({ tone = "green" }: { tone?: "green" | "blue" }) {
  const styles =
    tone === "blue"
      ? "bg-blue-100 text-blue-600"
      : "bg-emerald-100 text-emerald-600";
  return (
    <span className={cn("grid size-5 place-items-center rounded-full", styles)}>
      <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" />
    </span>
  );
}
