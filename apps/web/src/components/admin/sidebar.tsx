"use client";

import {
  Activity,
  Building2,
  ChevronLeft,
  Database,
  Globe2,
  LayoutDashboard,
  Monitor,
  Plug,
  Settings,
  ShieldCheck,
  UserRound,
  Webhook,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  count?: string;
  badge?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    label: "Command Center",
    items: [
      {
        label: "Command Center",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Identities", href: "/admin/identities", icon: UserRound },
      { label: "Organizations", href: "/admin/organizations", icon: Building2 },
      { label: "Devices", href: "/admin/devices", icon: Monitor },
      { label: "IP Records", href: "/admin/ip-records", icon: Globe2 },
      { label: "Certificates", href: "/admin/certificates", icon: ShieldCheck },
      // { label: "Aliases", href: "#", icon: Link2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Access Events", href: "/admin/access-events", icon: Activity },
      // { label: "Behavioral Events", href: "#", icon: Sparkles },
      // { label: "Trust Signals", href: "#", icon: Network },
      { label: "Webhook Logs", href: "/admin/webhook-logs", icon: Webhook },
      { label: "Pending Reviews", href: "/admin/pending-reviews", icon: Database },
    ],
  },
  // {
  //   label: "Risk & Analysis",
  //   items: [
  //     { label: "Risk Explorer", href: "#", icon: SquareStack },
  //     { label: "Threat Intelligence", href: "#", icon: Fingerprint },
  //     { label: "Attack Surface", href: "#", icon: Zap },
  //     { label: "MITRE ATT&CK", href: "#", icon: SlidersHorizontal, badge: "BETA" },
  //   ],
  // },
  {
    label: "Platform",
    items: [
      { label: "Integrations", href: "/admin/integrations", icon: Plug },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: Database },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="flex h-dvh flex-col border-r border-[var(--dashboard-border)] bg-white">
      <div className="flex h-[86px] items-center gap-3 px-7">
        <img
          src="/TunAI_Logo_Final.png"
          alt=""
          className="h-11 w-auto"
          aria-hidden="true"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-6">
        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--dashboard-muted)]">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--dashboard-border)] px-5 py-4">
        <button className="flex h-10 w-full items-center gap-3 rounded-md px-2 text-left text-[13px] font-medium text-[var(--dashboard-muted)] transition-colors hover:bg-slate-50 hover:text-[var(--dashboard-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Collapse
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        isActive &&
          "bg-blue-50 text-blue-600 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.04)]",
        !isActive &&
          "text-[var(--dashboard-text)] hover:bg-slate-50 hover:text-blue-600",
      )}
    >
      <Icon
        className={cn("size-4 stroke-[1.8]", isActive && "text-blue-600")}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.count ? (
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[12px] font-semibold text-blue-600">
          {item.count}
        </span>
      ) : null}
      {item.badge ? (
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
