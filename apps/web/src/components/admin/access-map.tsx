"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

type MapPoint = {
  name: string;
  coordinates: [number, number];
  events: number;
};

export function AccessMap({ points }: { points: MapPoint[] }) {
  const maxEvents = Math.max(...points.map((p) => p.events), 1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 220 });
  const [geoUrl, setGeoUrl] = useState("/world-atlas-110m.json");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setGeoUrl(`${window.location.origin}/world-atlas-110m.json`);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0)
        setDims({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white p-5 shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">
          Access by Location
        </h2>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--dashboard-border)] bg-white px-3 text-[12px] font-medium text-[var(--dashboard-text)] hover:bg-slate-50">
          7 Days
          <ChevronDown
            className="size-3.5 text-[var(--dashboard-muted)]"
            aria-hidden="true"
          />
        </button>
      </div>
      <div className="relative mt-4">
        <div
          ref={containerRef}
          className="h-[280px] w-full overflow-hidden rounded-md bg-white"
        >
          {dims.width > 0 && (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 56, center: [0, 22] }}
              width={dims.width}
              height={dims.height}
              style={{ width: "100%", height: "100%", display: "block" }}
            >
              <defs>
                <filter
                  id="dotGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies
                    .filter((geo) => {
                      const props = geo.properties as Record<string, string>;
                      const name = props?.name || props?.NAME || "";
                      return !/antarctica/i.test(name);
                    })
                    .map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#F1F5FA"
                        stroke="#e2e8f0"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                }
              </Geographies>
              {points.map((point) => {
                const size = 2 + (point.events / maxEvents) * 3;
                return (
                  <Marker key={point.name} coordinates={point.coordinates}>
                    <g>
                      <circle r={size + 3} fill="#93c5fd" fillOpacity={0.35} />
                      <circle r={size} fill="#0b6ff6" fillOpacity={0.95} />
                    </g>
                  </Marker>
                );
              })}
            </ComposableMap>
          )}
        </div>
        <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 rounded-md bg-white/90 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-[10px] font-medium text-[var(--dashboard-muted)]">
            Access Volume
          </span>
          <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--dashboard-muted)]">
            <span>Low</span>
            <span className="inline-flex h-1.5 w-12 items-center rounded-full bg-gradient-to-r from-[#bfdbfe] to-[#0b6ff6]" />
            <span>High</span>
          </div>
        </div>
      </div>
    </section>
  );
}
