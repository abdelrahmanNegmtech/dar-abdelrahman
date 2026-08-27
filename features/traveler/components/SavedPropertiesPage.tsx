"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Grid2X2, Heart, List, MapPin, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/features/system-states/hooks/useToast";
import { setSavedProperty } from "../actions";
import type { PropertyType, TravelerProperty } from "../types";
import { EmptyState, IconButton, PageHeader, PrimaryButton, PropertyCard, SearchInput, SecondaryButton, SelectField, cx } from "./shared";
import { getSavedCategories } from "../utils";

type ViewMode = "grid" | "list";

export function SavedPropertiesPage({ properties }: { properties: TravelerProperty[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PropertyType | "all">("all");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const categories = getSavedCategories(properties);
  const visibleProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = properties.filter((property) => {
      if (removedIds.has(property.id)) return false;
      const categoryMatch = category === "all" || property.type === category;
      const queryMatch =
        !normalizedQuery ||
        property.title.toLowerCase().includes(normalizedQuery) ||
        property.area.toLowerCase().includes(normalizedQuery) ||
        property.city.toLowerCase().includes(normalizedQuery);
      return categoryMatch && queryMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price_low") return a.pricePerNight - b.pricePerNight;
      if (sort === "price_high") return b.pricePerNight - a.pricePerNight;
      if (sort === "rating") return b.ratingAverage - a.ratingAverage;
      return b.reviewsCount - a.reviewsCount;
    });
  }, [category, properties, query, removedIds, sort]);

  function handleRemove(propertyId: string) {
    setRemovedIds((current) => new Set(current).add(propertyId));
    startTransition(async () => {
      const result = await setSavedProperty(propertyId, false);
      if (!result.ok) {
        setRemovedIds((current) => {
          const next = new Set(current);
          next.delete(propertyId);
          return next;
        });
      }
      showToast({
        description: result.message,
        title: result.ok ? "Removed from saved" : "Could not update saved",
        type: result.ok ? "success" : "error",
      });
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader description={`${properties.length} properties saved`} title="Saved properties" />

      <section className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_150px_220px_104px_120px]">
        <SearchInput onChange={setQuery} placeholder="Search saved properties..." value={query} />
        <SecondaryButton onClick={() => showToast({ description: "Use the category tabs and sort menu for local preview filtering.", title: "Filters preview", type: "info" })}>
          <SlidersHorizontal className="size-4" />
          Filters
        </SecondaryButton>
        <SelectField aria-label="Sort saved properties" onChange={(event) => setSort(event.target.value)} value={sort}>
          <option value="recent">Recently saved</option>
          <option value="rating">Top rated</option>
          <option value="price_low">Price low to high</option>
          <option value="price_high">Price high to low</option>
        </SelectField>
        <div className="grid grid-cols-2 gap-2">
          <IconButton className={cx(view === "grid" && "bg-dar-primary-soft text-dar-primary")} label="Grid view" onClick={() => setView("grid")}>
            <Grid2X2 className="size-4" />
          </IconButton>
          <IconButton className={cx(view === "list" && "bg-dar-primary-soft text-dar-primary")} label="List view" onClick={() => setView("list")}>
            <List className="size-4" />
          </IconButton>
        </div>
        <SecondaryButton onClick={() => showToast({ description: "Map view is a placeholder until map provider integration is connected.", title: "Map preview", type: "info" })}>
          <MapPin className="size-4" />
          Map view
        </SecondaryButton>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            className={cx(
              "shrink-0 rounded-xl border px-4 py-2 text-sm font-black transition",
              category === item.id
                ? "border-dar-primary bg-dar-primary-soft text-dar-primary"
                : "border-dar-border bg-white text-dar-muted hover:border-dar-primary",
            )}
            key={item.id}
            onClick={() => setCategory(item.id as PropertyType | "all")}
            type="button"
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {visibleProperties.length ? (
        <div className={cx(view === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4")}>
          {visibleProperties.map((property) => (                <PropertyCard
              action={
                <button
                  aria-label={`Remove ${property.title} from saved properties`}
                  className="grid size-9 place-items-center rounded-full bg-dar-primary-soft text-dar-primary disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={isPending}
                  onClick={() => handleRemove(property.id)}
                  type="button"
                >
                  <Heart className="size-5 fill-dar-primary" />
                </button>
              }
              key={property.id}
              onSave={handleRemove}
              property={property}
              view={view}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          action={
            <Link href="/search">
              <PrimaryButton>Explore more places</PrimaryButton>
            </Link>
          }
          description="Save apartments, studios, villas, and hotel stays you want to compare later."
          icon={Heart}
          title="No saved properties match your filters"
        />
      )}

      <section className="flex flex-col gap-4 rounded-dar border border-dar-border bg-[linear-gradient(90deg,#F7F2FF_0%,#FFFFFF_100%)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-full bg-dar-primary text-white">
            <Heart className="size-7 fill-white" />
          </span>
          <div>
            <h2 className="text-lg font-black text-dar-navy">Save properties you love</h2>
            <p className="mt-1 text-sm font-semibold text-dar-muted">Keep track of favorite places and book them when you are ready.</p>
          </div>
        </div>
        <Link href="/search">
          <SecondaryButton>Explore more places</SecondaryButton>
        </Link>
      </section>
    </div>
  );
}
