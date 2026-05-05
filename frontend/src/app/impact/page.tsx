"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ImpactData {
  totalOffers: number;
  activeOffers: number;
  fulfilledOffers: number;
  totalBusinesses: number;
  totalInstitutions: number;
  foodDivertedKg: number;
  co2SavedKg: number;
}

export default function ImpactPage() {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImpact() {
      try {
        const result = await api.get<ImpactData>("/api/impact");
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load impact data");
      } finally {
        setLoading(false);
      }
    }
    fetchImpact();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-green-600">Impact Dashboard</h1>
        <p className="text-gray-500">Loading impact metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-green-600">Impact Dashboard</h1>
        <p className="text-red-600">{error || "No data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-green-600">Impact Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-sm text-gray-500">Total Offers</p>
          <p className="text-2xl font-bold text-gray-800">{data.totalOffers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="text-3xl mb-3">🟢</div>
          <p className="text-sm text-gray-500">Active Offers</p>
          <p className="text-2xl font-bold text-green-600">{data.activeOffers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="text-3xl mb-3">✅</div>
          <p className="text-sm text-gray-500">Fulfilled Offers</p>
          <p className="text-2xl font-bold text-blue-600">{data.fulfilledOffers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="text-3xl mb-3">🏢</div>
          <p className="text-sm text-gray-500">Total Businesses</p>
          <p className="text-2xl font-bold text-gray-800">{data.totalBusinesses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="text-3xl mb-3">🏛️</div>
          <p className="text-sm text-gray-500">Total Institutions</p>
          <p className="text-2xl font-bold text-gray-800">{data.totalInstitutions}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="text-3xl mb-3">🍎</div>
          <p className="text-sm text-gray-500">Food Diverted</p>
          <p className="text-2xl font-bold text-green-600">{data.foodDivertedKg.toLocaleString()} kg</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <div className="text-3xl mb-3">🌱</div>
          <p className="text-sm text-gray-500">CO2 Saved</p>
          <p className="text-2xl font-bold text-teal-600">{data.co2SavedKg.toLocaleString()} kg</p>
        </div>
      </div>
    </div>
  );
}
