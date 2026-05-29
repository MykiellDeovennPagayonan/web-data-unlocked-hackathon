import {
  Activity,
  Building2,
  ChevronLeft,
  Database,
  Fingerprint,
  Globe2,
  LayoutDashboard,
  Link2,
  Monitor,
  Network,
  Plug,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareStack,
  UserRound,
  Webhook,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  selected?: boolean;
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
        icon: LayoutDashboard,
        active: true,
      },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { label: "Identities", icon: UserRound },
      { label: "Organizations", icon: Building2 },
      { label: "Devices", icon: Monitor },
      { label: "IP Records", icon: Globe2 },
      { label: "Certificates", icon: ShieldCheck },
      { label: "Aliases", icon: Link2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Access Events", icon: Activity, selected: true },
      { label: "Behavioral Events", icon: Sparkles },
      { label: "Trust Signals", icon: Network },
      { label: "Webhook Logs", icon: Webhook },
      { label: "Pending Reviews", icon: Database, count: "12" },
    ],
  },
  {
    label: "Risk & Analysis",
    items: [
      { label: "Risk Explorer", icon: SquareStack },
      { label: "Threat Intelligence", icon: Fingerprint },
      { label: "Attack Surface", icon: Zap },
      { label: "MITRE ATT&CK", icon: SlidersHorizontal, badge: "BETA" },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Integrations", icon: Plug },
      { label: "Audit Logs", icon: Database },
      { label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="flex h-dvh flex-col border-r border-[var(--dashboard-border)] bg-white">
      <div className="flex h-[86px] items-center gap-3 px-7">
        <span className="grid size-9 place-items-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
          <ShieldCheck className="size-6 stroke-[2]" aria-hidden="true" />
        </span>
        <span className="text-[18px] font-bold tracking-[0.12em] text-[var(--dashboard-text)]">
          TUNAI
        </span>
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
  const Icon = item.icon;

  return (
    <a
      href="#"
      aria-current={item.active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        item.active &&
          "bg-blue-50 text-blue-600 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.04)]",
        item.selected && !item.active && "bg-[#edf5ff] text-[var(--dashboard-text)]",
        !item.active &&
          !item.selected &&
          "text-[var(--dashboard-text)] hover:bg-slate-50 hover:text-blue-600",
      )}
    >
      <Icon
        className={cn("size-4 stroke-[1.8]", item.active && "text-blue-600")}
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
    </a>
  );
}
