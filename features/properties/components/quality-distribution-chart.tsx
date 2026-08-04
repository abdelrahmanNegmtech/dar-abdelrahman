import type { QualityDistributionItem } from "../types";

export function QualityDistributionChart({
  items,
}: {
  items: QualityDistributionItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const arcs = items.map((item, index) => {
    const previous = items.slice(0, index).reduce((sum, entry) => sum + entry.value, 0);
    return {
      ...item,
      dash: (item.value / total) * circumference,
      offset: (previous / total) * circumference,
    };
  });

  return (
    <svg viewBox="0 0 240 240" className="h-[214px] w-[214px]" role="img" aria-label="Quality distribution">
      <circle cx="120" cy="120" r={radius} fill="none" stroke="#EEF1F7" strokeWidth="36" />
      {arcs.map((item) => (
        <circle
          key={item.label}
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          stroke={item.color}
          strokeWidth="36"
          strokeDasharray={`${item.dash} ${circumference - item.dash}`}
          strokeDashoffset={-item.offset}
          transform="rotate(-90 120 120)"
        />
      ))}
      <circle cx="120" cy="120" r="20" fill="white" />
    </svg>
  );
}
