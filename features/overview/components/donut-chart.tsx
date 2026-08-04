import type { SignupSegment } from "../types";

type DonutChartProps = {
  segments: SignupSegment[];
  totalLabel: string;
};

export function DonutChart({ segments, totalLabel }: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const arcs = segments.map((segment, index) => {
    const previousTotal = segments
      .slice(0, index)
      .reduce((sum, entry) => sum + entry.value, 0);

    return {
      ...segment,
      dash: (segment.value / total) * circumference,
      offset: (previousTotal / total) * circumference,
    };
  });

  return (
    <svg
      viewBox="0 0 220 220"
      role="img"
      aria-label="User signup distribution chart"
      className="h-[220px] w-[220px]"
    >
      <circle cx="110" cy="110" r={radius} fill="none" stroke="#EEF1F7" strokeWidth="32" />
      {arcs.map((segment) => (
        <circle
          key={segment.label}
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={segment.color}
          strokeWidth="32"
          strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
          strokeDashoffset={-segment.offset}
          strokeLinecap="butt"
          transform="rotate(-90 110 110)"
        />
      ))}
      <circle cx="110" cy="110" r="42" fill="white" />
      <text x="110" y="107" textAnchor="middle" fontSize="28" fontWeight="700" fill="#0F172A">
        {totalLabel}
      </text>
      <text x="110" y="132" textAnchor="middle" fontSize="14" fill="#64748B">
        Total
      </text>
    </svg>
  );
}
