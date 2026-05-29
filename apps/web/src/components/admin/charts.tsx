"use client";

import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { DistributionSegment } from "./dashboard-data";

type SparklineProps = {
  data: number[];
  color: string;
  fill?: string;
};

export function Sparkline({ data, color, fill }: SparklineProps) {
  const points = data.map((value, index) => ({ index, value }));

  return (
    <div className="h-12 w-28">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 120, height: 56 }}
      >
        <AreaChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={fill ?? color}
            fillOpacity={0.08}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrustScoreGauge({ value }: { value: number }) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.max(0, Math.min(100, value));
  const dash = (normalizedValue / 100) * circumference;

  return (
    <div className="relative grid size-[74px] place-items-center">
      <svg className="size-[74px] -rotate-90" viewBox="0 0 82 82" aria-hidden="true">
        <defs>
          <linearGradient id="trust-score-ring" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0b6ff6" />
            <stop offset="100%" stopColor="#8db9ff" />
          </linearGradient>
        </defs>
        <circle
          cx="41"
          cy="41"
          r={radius}
          fill="none"
          stroke="#edf3fb"
          strokeWidth="9"
        />
        <circle
          cx="41"
          cy="41"
          r="22"
          fill="none"
          stroke="#f4f8fe"
          strokeWidth="1.5"
        />
        <circle
          cx="41"
          cy="41"
          r={radius}
          fill="none"
          stroke="url(#trust-score-ring)"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="8.5"
        />
        <circle cx="41" cy="10" r="2.3" fill="#0b6ff6" />
      </svg>
      <span className="absolute text-[22px] font-semibold text-[var(--dashboard-text)]">
        {value}
      </span>
    </div>
  );
}

export function WebhookHealthChart({
  data,
}: {
  data: Array<{ time: string; success: number }>;
}) {
  return (
    <div className="h-[98px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 420, height: 98 }}
      >
        <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -26 }}>
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            interval={1}
            tick={{ fill: "#607196", fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            ticks={[0, 50, 100]}
            domain={[0, 100]}
            tickFormatter={(tick: number) => `${tick}%`}
            tick={{ fill: "#607196", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="success"
            stroke="#0b6ff6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({
  segments,
  total,
}: {
  segments: DistributionSegment[];
  total: string;
}) {
  return (
    <div className="relative grid size-[112px] shrink-0 place-items-center">
      {segments.length > 0 ? (
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 112, height: 112 }}
        >
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              innerRadius={36}
              outerRadius={51}
              paddingAngle={1}
              cornerRadius={3}
              stroke="#ffffff"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {segments.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <svg className="size-[112px]" viewBox="0 0 112 112" aria-hidden="true">
          <circle
            cx="56"
            cy="56"
            r="43"
            fill="none"
            stroke="#edf3fb"
            strokeWidth="15"
          />
        </svg>
      )}
      <div className="absolute text-center leading-tight">
        <div className="text-[16px] font-semibold text-[var(--dashboard-text)]">
          {total}
        </div>
        <div className="text-[10px] font-medium text-[var(--dashboard-muted)]">
          Total
        </div>
      </div>
    </div>
  );
}
