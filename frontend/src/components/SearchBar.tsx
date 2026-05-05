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
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          Search
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              category === cat
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
