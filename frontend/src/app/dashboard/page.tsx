"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { OfferCard, OfferCardData } from "@/components/OfferCard";

interface OffersResponse {
  offers: OfferCardData[];
}

export default function DashboardPage() {
  const {
    authenticated,
    hasProfile,
    role,
    address,
    loading: authLoading,
  } = useAuth();
  const [offers, setOffers] = useState<OfferCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated || !hasProfile || !role || !address) {
      setLoading(false);
      return;
    }

    async function fetchOffers() {
      try {
        const params = new URLSearchParams();
        params.set("status", "ACTIVE");
        const data = await api.get<OffersResponse>(
          `/api/offers?${params.toString()}`
        );
        if (role === "BUSINESS") {
          setOffers(
            data.offers.filter(
              (o) =>
                o.creator.address &&
                address &&
                o.creator.address.toLowerCase() === address.toLowerCase()
            )
          );
        } else {
          setOffers(data.offers);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load offers"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOffers();
  }, [authenticated, hasProfile, role, address]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted font-mono text-sm">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="font-serif text-4xl">Dashboard</h1>
        <p className="text-muted">Please sign in to view your dashboard.</p>
        <Link
          href="/login"
          className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="font-serif text-4xl">Dashboard</h1>
        <p className="text-muted">Please complete your profile setup.</p>
        <Link
          href="/register"
          className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
        >
          Create Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-4xl">
          {role === "BUSINESS" ? "Business Dashboard" : "Institution Dashboard"}
        </h1>
        {role === "BUSINESS" ? (
          <Link
            href="/offers/new"
            className="bg-accent text-white px-5 py-2.5 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
          >
            Create New Offer
          </Link>
        ) : (
          <Link
            href="/explore"
            className="bg-accent text-white px-5 py-2.5 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
          >
            Browse All Offers
          </Link>
        )}
      </div>

      {loading && <p className="text-muted font-mono text-sm">Loading offers...</p>}
      {error && <p className="text-pale-red-text text-sm font-mono">{error}</p>}
      {!loading && !error && offers.length === 0 && (
        <p className="text-muted">No offers found.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}