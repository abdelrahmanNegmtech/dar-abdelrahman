import type { OverviewRevenuePoint } from "../types";

type BarChartProps = {
  points: OverviewRevenuePoint[];
};

export function BarChart({ points }: BarChartProps) {
  const width = 620;
  const height = 250;
  const paddingX = 34;
  const topPadding = 18;
  const bottomPadding = 36;
  const chartHeight = height - topPadding - bottomPadding;
  const chartWidth = width - paddingX * 2;
  const maxValue = Math.max(...points.map((point) => point.value), 800000);
  const ticks = [0, 200000, 400000, 600000, 800000];
  const barWidth = chartWidth / points.length - 28;
  const step = chartWidth / points.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Revenue overview bar chart"
      className="h-[250px] w-full"
    >
      {ticks.map((tick) => {
        const y = topPadding + chartHeight - (tick / maxValue) * chartHeight;

        return (
          <g key={tick}>
            <line
              x1={paddingX}
              x2={width - paddingX}
              y1={y}
              y2={y}
              stroke="#E6EAF3"
              strokeDasharray="3 5"
            />
            <text
              x={paddingX - 12}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#64748B"
            >
              {tick === 0 ? "0" : `${tick / 1000}K`}
            </text>
          </g>
        );
      })}

      {points.map((point, index) => {
        const barHeight = (point.value / maxValue) * chartHeight;
        const x = paddingX + index * step + (step - barWidth) / 2;
        const y = topPadding + chartHeight - barHeight;

        return (
          <g key={point.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="3"
              fill="#6B42F2"
            />
            <text
              x={x + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fontSize="11"
              fill="#64748B"
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
