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
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="text-3xl font-bold text-green-600">Dashboard</h1>
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
        <Link
          href="/login"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="text-3xl font-bold text-green-600">Dashboard</h1>
        <p className="text-gray-600">Please complete your profile setup.</p>
        <Link
          href="/register"
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition font-semibold"
        >
          Create Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-600">
          {role === "BUSINESS" ? "Business Dashboard" : "Institution Dashboard"}
        </h1>
        {role === "BUSINESS" ? (
          <Link
            href="/offers/new"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Create New Offer
          </Link>
        ) : (
          <Link
            href="/explore"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
          >
            Browse All Offers
          </Link>
        )}
      </div>

      {loading && <p className="text-gray-500">Loading offers...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && offers.length === 0 && (
        <p className="text-gray-500">No offers found.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
