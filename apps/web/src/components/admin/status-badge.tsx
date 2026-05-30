import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "./dashboard-data";

type StatusBadgeProps = {
  level: RiskLevel | "beta";
  children?: ReactNode;
  className?: string;
};

const dotColors: Record<StatusBadgeProps["level"], string> = {
  critical: "bg-red-500",
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
  beta: "bg-blue-500",
};

export function StatusBadge({ level, children, className }: StatusBadgeProps) {
  const label = (children ?? level)
    .toString()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--dashboard-text)]",
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", dotColors[level])} />
      {label}
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
