import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "./dashboard-data";

type StatusBadgeProps = {
  level: RiskLevel | "beta";
  children?: ReactNode;
  className?: string;
};

const badgeClasses: Record<StatusBadgeProps["level"], string> = {
  critical:
    "border-red-100 bg-red-50 text-red-600 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.08)]",
  high: "border-red-100 bg-red-50 text-red-600 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.08)]",
  medium:
    "border-amber-100 bg-amber-50 text-amber-600 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.12)]",
  low: "border-emerald-100 bg-emerald-50 text-emerald-600 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]",
  beta: "border-blue-100 bg-blue-50 text-blue-600 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]",
};

export function StatusBadge({ level, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center justify-center rounded px-2 text-[11px] font-semibold uppercase leading-none",
        badgeClasses[level],
        className,
      )}
    >
      {children ?? level}
    </span>
  );
}

export function ScoreBar({ value }: { value: number }) {
  const tone =
    value < 35 ? "bg-red-500" : value < 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex w-[118px] items-center gap-3">
      <span className="w-6 text-[12px] font-medium text-[var(--dashboard-text)]">
        {value}
      </span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <span
          className={cn("block h-full rounded-full", tone)}
          style={{ width: `${value}%` }}
        />
      </span>
    </div>
  );
}
