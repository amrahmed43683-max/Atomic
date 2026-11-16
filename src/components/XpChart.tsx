import { useState } from 'react';

interface XpChartPoint {
  date: string;
  label: string;
  xp: number;
}

interface XpChartProps {
  points: XpChartPoint[];
}

export function XpChart({ points }: XpChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 760;
  const height = 240;
  const padTop = 20;
  const padBottom = 36;
  const padLeft = 44;
  const padRight = 20;

  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const maxVal = Math.max(50, ...points.map((p) => p.xp));
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  const coords = points.map((p, idx) => {
    const x =
      points.length <= 1
        ? padLeft + innerW / 2
        : padLeft + (idx / (points.length - 1)) * innerW;
    const y = padTop + innerH - (p.xp / maxVal) * innerH;
    return { ...p, x, y };
  });

  const linePath =
    coords.length > 0
      ? coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
      : '';

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`
      : '';

  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : null;
  const labelStep = points.length > 16 ? 4 : points.length > 9 ? 2 : 1;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-60 overflow-visible select-none"
        role="img"
        aria-label="رسم بياني لنقاط الخبرة اليومية"
      >
        <defs>
          <linearGradient id="xpAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padTop + innerH - (tick / maxVal) * innerH;
          return (
            <g key={tick}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#1f2742"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#7e87a8] text-[11px] font-mono tabular-nums"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {areaPath && <path d={areaPath} fill="url(#xpAreaGrad)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {coords.map((c, idx) => {
          const isHovered = hoveredIdx === idx;
          const showLabel = idx % labelStep === 0 || idx === coords.length - 1;
          return (
            <g key={c.date}>
              {showLabel && (
                <text
                  x={c.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="fill-[#7e87a8] text-[11px]"
                >
                  {c.label}
                </text>
              )}
              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? 6 : 3.5}
                fill={isHovered ? '#22d3ee' : '#a78bfa'}
                stroke="#070911"
                strokeWidth="2"
                className="transition-all duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </g>
          );
        })}
      </svg>

      {activePoint && (
        <div className="mt-2 flex items-center justify-between rounded-lg border border-[#1f2742] bg-[#0b0f1c] px-3 py-2 text-xs">
          <span className="text-[#9aa3c2]">{activePoint.date} · {activePoint.label}</span>
          <span className="font-mono font-bold text-cyan-400 tabular-nums">
            +{activePoint.xp} XP
          </span>
        </div>
      )}
    </div>
  );
}
