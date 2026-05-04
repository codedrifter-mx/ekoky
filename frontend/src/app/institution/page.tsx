"use client";

import { useAccount } from "wagmi";
import { useOffers, useExpressInterest } from "@/hooks/useOfferMarketplace";
import { OfferCard } from "@/components/OfferCard";
import { useState } from "react";

export default function InstitutionPage() {
  const { isConnected } = useAccount();
  const { offers, refetch } = useOffers();
  const { expressInterest, isPending, isSuccess } = useExpressInterest();
  const [lastInteractedId, setLastInteractedId] = useState<bigint | null>(null);

  const handleExpressInterest = (offerId: bigint) => {
    if (!isConnected) return;
    setLastInteractedId(offerId);
    expressInterest(offerId);
  };

  if (isSuccess && lastInteractedId !== null) {
    setTimeout(() => refetch(), 1000);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-teal-600 mb-6">Institution Dashboard</h1>

      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">Connect your wallet to express interest in offers.</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Available Offers ({offers.length})</h2>
      {offers.length === 0 ? (
        <p className="text-gray-500">No offers available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id.toString()}
              offer={offer}
              showInterestButton={isConnected}
              onExpressInterest={handleExpressInterest}
              isPending={isPending && lastInteractedId === offer.id}
            />
          ))}
        </div>
      )}

      {isSuccess && lastInteractedId !== null && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
          Interest expressed! Transaction confirmed.
        </div>
      )}
    </div>
  );
}
