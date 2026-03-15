"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";

const TIME_OPTIONS = [
  { value: "", label: "Toutes les durées" },
  { value: "rapide", label: "Rapide (≤ 30 min)" },
  { value: "moyen", label: "Moyen (30-60 min)" },
  { value: "long", label: "Long (> 60 min)" },
] as const;

const DEBOUNCE_MS = 300;

interface Props {
  categories?: string[];
}

export default function RecipeFilters({ categories = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const time = searchParams.get("time") ?? "";
  const category = searchParams.get("category") ?? "";
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function updateParams(updates: { search?: string; time?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.search !== undefined) {
      if (updates.search) params.set("search", updates.search);
      else params.delete("search");
    }
    if (updates.time !== undefined) {
      if (updates.time) params.set("time", updates.time);
      else params.delete("time");
    }
    if (updates.category !== undefined) {
      if (updates.category) params.set("category", updates.category);
      else params.delete("category");
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/", { scroll: false });
  }

  function handleSearchChange(value: string) {
    setLocalSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value.trim() });
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
        <input
          type="search"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher une recette..."
          className="w-full rounded-full border border-[#E5E7EB] bg-white py-2 pl-10 pr-4 text-sm text-[#2b2d2f] placeholder:text-[#6b7280] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
          aria-label="Rechercher"
        />
      </div>
      <div className="relative">
        <select
          value={time}
          onChange={(e) => updateParams({ time: e.target.value })}
          className="w-full min-w-[180px] appearance-none rounded-full border border-[#E5E7EB] bg-white pl-4 pr-9 py-2 text-sm text-[#2b2d2f] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
          style={{ backgroundImage: "none" }}
          aria-label="Filtrer par durée totale (préparation + cuisson)"
        >
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
      </div>
      {categories.length > 0 && (
        <div className="relative">
          <select
            value={category}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="w-full min-w-[160px] appearance-none rounded-full border border-[#E5E7EB] bg-white pl-4 pr-9 py-2 text-sm text-[#2b2d2f] focus:border-[#2d6a4f] focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
            style={{ backgroundImage: "none" }}
            aria-label="Filtrer par type"
          >
            <option value="">Tous les types</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
        </div>
      )}
    </div>
  );
}
