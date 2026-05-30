"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

type SparklineProps = {
  data: number[];
  color: string;
};

export function Sparkline({ data, color }: SparklineProps) {
  const safeData = data.length === 1 ? [data[0], data[0]] : data;
  const points = safeData.map((value, index) => ({ index, value }));

  return (
    <div className="h-12 w-28">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 120, height: 56 }}
      >
        <AreaChart
          data={points}
          margin={{ top: 4, right: 2, bottom: 4, left: 2 }}
        >
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={color}
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
      <svg
        className="size-[74px] -rotate-90"
        viewBox="0 0 82 82"
        aria-hidden="true"
      >
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
