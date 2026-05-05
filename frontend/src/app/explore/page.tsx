"use client";

import { useState, useEffect } from "react";
import { SearchBar, SearchCategory } from "@/components/SearchBar";
import { OfferCard, OfferCardData } from "@/components/OfferCard";
import { api } from "@/lib/api";

interface OffersResponse {
  offers: OfferCardData[];
  total: number;
  page: number;
  limit: number;
}

export default function ExplorePage() {
  const [query, setQuery] = useState<{
    search: string;
    category: SearchCategory;
    page: number;
  }>({ search: "", category: "All", page: 1 });

  const [offers, setOffers] = useState<OfferCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    async function fetchOffers() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("status", "ACTIVE");
        params.set("page", String(query.page));
        params.set("limit", String(limit));
        if (query.search) params.set("search", query.search);
        if (query.category !== "All")
          params.set("category", query.category.toUpperCase());

        const data = await api.get<OffersResponse>(
          `/api/offers?${params.toString()}`
        );
        setOffers(data.offers);
        setTotal(data.total);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load offers"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, [query]);

  const totalPages = Math.ceil(total / limit);

  const handleSearchChange = (search: string) => {
    setQuery((q) => ({ ...q, search, page: 1 }));
  };

  const handleCategoryChange = (category: SearchCategory) => {
    setQuery((q) => ({ ...q, category, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setQuery((q) => ({ ...q, page }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-600">Explore Offers</h1>
      <SearchBar
        search={query.search}
        category={query.category}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
      />

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && offers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No offers available</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => handlePageChange(Math.max(1, query.page - 1))}
            disabled={query.page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {query.page} of {totalPages}
          </span>
          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, query.page + 1))
            }
            disabled={query.page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
