"use client";

import {
  ClipboardList,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import type { ReviewItem } from "./dashboard-data";

export function PendingReviewsCard({
  total,
  highPriority,
}: {
  items: ReviewItem[];
  total: number;
  highPriority: number;
}) {
  return (
    <a
      href="#"
      className="flex items-center gap-4 rounded-lg border border-[var(--dashboard-border)] bg-white p-4 shadow-[0_8px_30px_rgba(11,27,77,0.04)] transition-colors hover:bg-slate-50/50"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
        <ClipboardList className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[var(--dashboard-muted)]">
          Pending Reviews
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[24px] font-bold text-[var(--dashboard-text)]">
            {total}
          </span>
          <span className="text-[12px] font-medium text-red-500">
            {highPriority} high priority
          </span>
        </div>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-[var(--dashboard-muted)]"
        aria-hidden="true"
      />
    </a>
  );
}

export function AiInsightsCard({ insights }: { insights: string[] }) {
  return (
    <a
      href="#"
      className="flex items-center gap-4 rounded-lg border border-[var(--dashboard-border)] bg-white p-4 shadow-[0_8px_30px_rgba(11,27,77,0.04)] transition-colors hover:bg-slate-50/50"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[var(--dashboard-muted)]">
          AI Insights
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[24px] font-bold text-[var(--dashboard-text)]">
            {insights.length}
          </span>
          <span className="text-[12px] font-medium text-blue-600">
            New insights available
          </span>
        </div>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-[var(--dashboard-muted)]"
        aria-hidden="true"
      />
    </a>
  );
}

export function CertificateHealthCard({
  percent,
}: {
  percent: number;
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  return (
    <a
      href="#"
      className="flex items-center gap-4 rounded-lg border border-[var(--dashboard-border)] bg-white p-4 shadow-[0_8px_30px_rgba(11,27,77,0.04)] transition-colors hover:bg-slate-50/50"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e8f0fe] text-[#096eed]">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-[var(--dashboard-muted)]">
          Certificate Health
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-[24px] font-bold text-[var(--dashboard-text)]">
            {percent}%
          </span>
          <span className="text-[12px] font-medium text-[#70abfa]">
            All certificates healthy
          </span>
        </div>
      </div>
      <ChevronRight
        className="size-5 shrink-0 text-[var(--dashboard-muted)]"
        aria-hidden="true"
      />
    </a>
  );
}
