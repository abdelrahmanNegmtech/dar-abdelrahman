import { Checkbox, Select } from "@/features/design-system";

import type { PropertyRecord } from "../types";
import {
  ActionCell,
  OwnerCell,
  PerformanceCell,
  PriceCell,
  PropertyCell,
  QualityScoreCell,
  StatusCell,
  VerificationCell,
} from "./properties-table-columns";

export function PropertiesTable({
  rows,
  selectedPropertyId,
  selectedRowIds,
  allVisibleRowsSelected,
  onSelectProperty,
  onToggleRow,
  onToggleAll,
  page,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}: {
  rows: PropertyRecord[];
  selectedPropertyId: string;
  selectedRowIds: string[];
  allVisibleRowsSelected: boolean;
  onSelectProperty: (id: string) => void;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rowsPerPage: string;
  onRowsPerPageChange: (value: string) => void;
}) {
  return (
    <section className="rounded-[0.75rem] border border-border/90 bg-white px-3 py-2 shadow-[0_2px_10px_rgba(16,25,58,0.03)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-transparent text-left text-[8px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              <th className="h-[36px] w-8 px-2 py-2">
                <Checkbox
                  id="properties-select-all"
                  label=""
                  aria-label="Select all properties"
                  checked={allVisibleRowsSelected}
                  onChange={onToggleAll}
                />
              </th>
              <th className="h-[36px] min-w-[220px] px-2 py-2 text-[9px]">Property</th>
              <th className="h-[36px] min-w-[150px] px-2 py-2 text-[9px]">Owner</th>
              <th className="h-[36px] px-2 py-2 text-[9px]">Type</th>
              <th className="h-[36px] px-2 py-2 text-[9px]">City / Area</th>
              <th className="h-[36px] px-2 py-2 text-[9px]">Price</th>
              <th className="h-[36px] px-2 py-2 text-[9px]">Quality score</th>
              <th className="h-[36px] min-w-[150px] px-2 py-2 text-[9px]">Verification</th>
              <th className="h-[36px] min-w-[110px] px-2 py-2 text-[9px]">Status</th>
              <th className="h-[36px] px-2 py-2 text-[9px]">Performance</th>
              <th className="h-[36px] px-2 py-2 text-[9px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = selectedRowIds.includes(row.id);
              const active = row.id === selectedPropertyId;

              return (
                <tr
                  key={row.id}
                  aria-selected={active}
                  onClick={() => onSelectProperty(row.id)}
                  className={`cursor-pointer text-[12px] text-foreground transition-colors ${
                    active
                      ? "bg-brand-soft/22 ring-1 ring-inset ring-brand/15"
                      : selected
                        ? "bg-brand-soft/12"
                        : "bg-white hover:bg-[linear-gradient(180deg,rgba(248,250,253,0.88),rgba(245,248,252,0.96))]"
                  }`}
                >
                  <td className="border-t border-border/80 px-2 py-3 align-top">
                    <div onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        id={`properties-select-${row.id}`}
                        label=""
                        aria-label={`Select property ${row.id}`}
                        checked={selected}
                        onChange={() => onToggleRow(row.id)}
                      />
                    </div>
                  </td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><PropertyCell property={row} /></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><OwnerCell property={row} /></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><span className="text-[12px] text-foreground">{row.type}</span></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><span className="text-[12px] text-foreground">{row.cityArea}</span></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><PriceCell price={row.price} /></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><QualityScoreCell score={row.qualityScore} /></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><VerificationCell property={row} /></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><StatusCell property={row} /></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><PerformanceCell property={row} /></td>
                  <td className="border-t border-border/80 px-2 py-3 align-top"><ActionCell property={row} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/80 pt-3 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-[12px] font-medium text-foreground-muted">
          Showing 1 to 5 of 2,860 properties
        </p>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
          <div className="flex items-center gap-1.5">
            <PagerButton label="‹" disabled={page === 1} onClick={() => onPageChange(page - 1)} />
            {[1, 2, 3, 4, 5].map((pageNumber) => (
              <PagerButton
                key={pageNumber}
                label={String(pageNumber)}
                active={page === pageNumber}
                onClick={() => onPageChange(pageNumber)}
              />
            ))}
            <span className="px-1 text-[11px] text-foreground-muted">…</span>
            <PagerButton label={String(totalPages)} onClick={() => onPageChange(totalPages)} />
            <PagerButton label="›" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} />
          </div>
          <div className="w-full max-w-[98px] xl:w-[98px]">
            <Select
              aria-label="Rows per page"
              value={rowsPerPage}
              onChange={(event) => onRowsPerPageChange(event.target.value)}
              options={[
                { label: "5 / page", value: "5" },
                { label: "10 / page", value: "10" },
                { label: "20 / page", value: "20" },
              ]}
              className="h-8 rounded-[0.4rem] text-[11px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PagerButton({
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-[0.4rem] border px-2.5 text-[11px] ${
        active
          ? "border-brand bg-brand text-white"
          : "border-border/90 bg-white text-foreground disabled:opacity-50"
      }`}
    >
      {label}
    </button>
  );
}
