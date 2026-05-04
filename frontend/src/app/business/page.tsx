"use client";

import { useOffers, useCreateOffer } from "@/hooks/useOfferMarketplace";
import { OfferCard } from "@/components/OfferCard";
import { useState } from "react";

export default function BusinessPage() {
  const { offers, refetch } = useOffers();
  const { createOffer, isPending, isConfirming, isSuccess } = useCreateOffer();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOffer(name, objective, description, location);
  };

  if (isSuccess) {
    setName("");
    setObjective("");
    setDescription("");
    setLocation("");
    setShowForm(false);
    setTimeout(() => refetch(), 1000);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-600">Business Dashboard</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {showForm ? "Cancel" : "Create Offer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">New Food Waste Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="e.g. Green Grocers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objective *</label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="e.g. Reduce vegetable waste"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={3}
                placeholder="Describe the food waste in detail..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="e.g. 123 Green St, Portland"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {isConfirming ? "Confirming..." : isPending ? "Sending..." : "Submit Offer"}
          </button>
          {isSuccess && <p className="mt-2 text-green-600 text-sm">Offer created successfully!</p>}
        </form>
      )}

      <h2 className="text-xl font-semibold mb-4">All Offers ({offers.length})</h2>
      {offers.length === 0 ? (
        <p className="text-gray-500">No offers yet. Create one above!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id.toString()} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
