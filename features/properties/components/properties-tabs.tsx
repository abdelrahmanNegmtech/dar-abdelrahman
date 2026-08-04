import type { PropertyCategory } from "../types";

export function PropertiesTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ value: PropertyCategory; label: string; count: string }>;
  activeTab: PropertyCategory;
  onChange: (value: PropertyCategory) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => {
        const active = tab.value === activeTab;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-1.5 rounded-[0.42rem] border px-3 py-1.5 text-[11px] transition-colors ${
              active
                ? "border-brand bg-brand text-white"
                : "border-border/90 bg-white text-foreground-muted hover:text-foreground"
            }`}
          >
            <span className={active ? "font-semibold" : "font-medium"}>{tab.label}</span>
            <span className={active ? "text-white/85" : "text-foreground-subtle"}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
