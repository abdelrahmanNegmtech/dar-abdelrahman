import type { OverviewLinePoint } from "../types";

type LineChartProps = {
  points: OverviewLinePoint[];
};

export function LineChart({ points }: LineChartProps) {
  const width = 720;
  const height = 250;
  const paddingX = 40;
  const topPadding = 18;
  const bottomPadding = 36;
  const maxValue = Math.max(...points.flatMap((point) => [point.thisWeek, point.lastWeek]));
  const chartHeight = height - topPadding - bottomPadding;
  const chartWidth = width - paddingX * 2;
  const ticks = [0, 200, 400, 600, 800];

  const buildLine = (key: "thisWeek" | "lastWeek") =>
    points
      .map((point, index) => {
        const x = paddingX + (index / Math.max(points.length - 1, 1)) * chartWidth;
        const y =
          topPadding +
          chartHeight -
          ((point[key] as number) / Math.max(maxValue, 800)) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

  const thisWeekLine = buildLine("thisWeek");
  const lastWeekLine = buildLine("lastWeek");

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Bookings overview line chart"
        className="h-[250px] w-full"
      >
        {ticks.map((tick) => {
          const y =
            topPadding +
            chartHeight -
            (tick / Math.max(maxValue, 800)) * chartHeight;

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
                x={paddingX - 16}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#64748B"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <polyline
          fill="none"
          stroke="#AAB4D6"
          strokeWidth="2"
          strokeDasharray="5 5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={lastWeekLine}
        />
        <polyline
          fill="none"
          stroke="#5B34E6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={thisWeekLine}
        />

        {points.map((point, index) => {
          const x = paddingX + (index / Math.max(points.length - 1, 1)) * chartWidth;
          const y =
            topPadding +
            chartHeight -
            (point.thisWeek / Math.max(maxValue, 800)) * chartHeight;

          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r={index === points.length - 1 ? 4 : 3.2} fill="#5B34E6" />
              <text
                x={x}
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
    </div>
  );
}
