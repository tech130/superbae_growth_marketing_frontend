"use client";

import React from "react";

/**
 * Small, dependency-free chart primitives built on inline SVG. The app has
 * no chart library installed, and these screens don't need one — a couple
 * of trend lines and bar breakdowns cover every chart the spec calls for.
 */

interface Series {
  label: string;
  color: string; // CSS var, e.g. "var(--violet)"
  data: number[];
}

export function TrendChart({
  labels,
  series,
  height = 200,
  formatValue,
}: {
  labels: string[];
  series: Series[];
  height?: number;
  formatValue?: (n: number) => string;
}) {
  const width = 100; // percentage-based viewBox, scales via CSS width:100%
  const pad = 4;
  const maxVal = Math.max(1, ...series.flatMap((s) => s.data));
  const n = labels.length;
  const x = (i: number) => pad + (i / Math.max(1, n - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - (v / maxVal) * (height - pad * 2);

  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" className="overflow-visible">
        {/* gridlines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad} x2={width - pad} y1={height - pad - f * (height - pad * 2)} y2={height - pad - f * (height - pad * 2)} stroke="var(--line)" strokeWidth={0.3} />
        ))}
        {series.map((s) => {
          const points = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
          const areaPoints = `${x(0)},${height - pad} ${points} ${x(n - 1)},${height - pad}`;
          return (
            <g key={s.label}>
              <polygon points={areaPoints} fill={s.color} opacity={0.08} />
              <polyline points={points} fill="none" stroke={s.color} strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
        {hoverIdx !== null && <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={pad} y2={height - pad} stroke="var(--muted)" strokeWidth={0.3} strokeDasharray="1,1" />}
        {/* invisible hit targets for hover */}
        {labels.map((_, i) => (
          <rect
            key={i}
            x={x(i) - width / n / 2}
            y={0}
            width={width / n}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}
      </svg>
      <div className="flex items-center gap-4 mt-2">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
      {hoverIdx !== null && (
        <div className="absolute top-0 right-0 bg-[var(--ink-900)] text-white text-[11px] rounded-md px-2 py-1.5 pointer-events-none">
          <div className="text-white/60 mb-0.5">{labels[hoverIdx]}</div>
          {series.map((s) => (
            <div key={s.label}>
              {s.label}: <span className="font-mono">{formatValue ? formatValue(s.data[hoverIdx]) : s.data[hoverIdx]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarChart({
  data,
  color = "var(--violet)",
  formatValue,
  horizontal = true,
}: {
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (n: number) => string;
  horizontal?: boolean;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = formatValue || ((n: number) => String(n));

  if (!horizontal) {
    return (
      <div className="flex items-end gap-2 h-40">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="text-[10px] font-mono text-[var(--muted)] mb-1">{fmt(d.value)}</div>
            <div className="w-full rounded-t-sm" style={{ height: `${Math.max(2, (d.value / max) * 100)}%`, background: color }} />
            <div className="text-[10px] text-[var(--muted)] mt-1 truncate w-full text-center">{d.label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-28 text-xs truncate text-[var(--muted)]">{d.label}</div>
          <div className="flex-1 h-5 bg-[var(--paper)] rounded overflow-hidden">
            <div className="h-full rounded flex items-center justify-end px-1.5" style={{ width: `${Math.max(3, (d.value / max) * 100)}%`, background: color }}>
              <span className="text-[10px] font-mono text-white">{fmt(d.value)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
