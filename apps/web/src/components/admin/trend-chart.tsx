"use client";

import { useEffect, useRef, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

type TrendPoint = {
  date: string;
  events: number;
};

function CustomDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: TrendPoint;
}) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill="#0b6ff6"
      stroke="#ffffff"
      strokeWidth={2.5}
    />
  );
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(520);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setWidth(Math.floor(rect.width));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white p-5 shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">
        Access Events Trend
      </h2>
      <div ref={containerRef} className="mt-4 h-[260px] w-full">
        <AreaChart
          width={width}
          height={260}
          data={data}
          margin={{ top: 16, right: 16, bottom: 0, left: -16 }}
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b6ff6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0b6ff6" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#607196", fontSize: 12, fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#607196", fontSize: 12, fontWeight: 500 }}
            tickFormatter={(v: number) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e4eaf4",
              boxShadow: "0 8px 30px rgba(11,27,77,0.08)",
              fontSize: 12,
              fontWeight: 500,
            }}
            labelStyle={{ color: "#0b1b4d", fontWeight: 600 }}
            itemStyle={{ color: "#0b6ff6" }}
            formatter={(value) => [`${value} events`, "Access Events"]}
          />
          <Area
            type="monotone"
            dataKey="events"
            stroke="#0b6ff6"
            strokeWidth={2.5}
            fill="url(#trendGradient)"
            dot={<CustomDot />}
            activeDot={{
              r: 6,
              fill: "#0b6ff6",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </div>
    </section>
  );
}
