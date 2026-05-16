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
      <div className="space-y-10">
        <h1 className="font-serif text-4xl">Impact Dashboard</h1>
        <p className="text-muted font-mono text-sm">Loading impact metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-10">
        <h1 className="font-serif text-4xl">Impact Dashboard</h1>
        <p className="text-pale-red-text text-sm font-mono">{error || "No data available"}</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Offers", value: data.totalOffers, color: "" },
    { label: "Active Offers", value: data.activeOffers, color: "text-pale-green-text" },
    { label: "Fulfilled Offers", value: data.fulfilledOffers, color: "text-pale-blue-text" },
    { label: "Total Businesses", value: data.totalBusinesses, color: "" },
    { label: "Total Institutions", value: data.totalInstitutions, color: "" },
    { label: "Food Diverted", value: `${data.foodDivertedKg.toLocaleString()} kg`, color: "text-pale-green-text" },
    { label: "CO2 Saved", value: `${data.co2SavedKg.toLocaleString()} kg`, color: "text-pale-teal-text" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted mb-3">Metrics</p>
        <h1 className="font-serif text-5xl">Impact Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-[8px] overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface p-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color || "text-foreground"}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}