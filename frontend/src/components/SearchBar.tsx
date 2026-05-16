"use client";

import { useState } from "react";

const CATEGORIES = [
  "All",
  "Produce",
  "Dairy",
  "Bakery",
  "Prepared",
  "Packaged",
  "Beverages",
  "Mixed",
] as const;

export type SearchCategory = (typeof CATEGORIES)[number];

interface SearchBarProps {
  search: string;
  category: SearchCategory;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: SearchCategory) => void;
}

export function SearchBar({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: SearchBarProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search offers..."
          className="flex-1 border border-border bg-surface rounded-[4px] px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="bg-accent text-white px-5 py-2 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
        >
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1 rounded-[9999px] text-xs font-mono uppercase tracking-[0.06em] transition-colors ${
              category === cat
                ? "bg-accent text-white"
                : "bg-surface-alt text-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}