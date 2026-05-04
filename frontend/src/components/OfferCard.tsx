"use client";

import { Offer } from "@/hooks/useOfferMarketplace";

interface OfferCardProps {
  offer: Offer;
  showInterestButton?: boolean;
  onExpressInterest?: (id: bigint) => void;
  isPending?: boolean;
}

export function OfferCard({ offer, showInterestButton, onExpressInterest, isPending }: OfferCardProps) {
  const date = new Date(Number(offer.createdAt) * 1000);
  const formattedDate = date.toLocaleDateString();
  const shortAddress = `${offer.creator.slice(0, 6)}...${offer.creator.slice(-4)}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-green-700">{offer.name}</h3>
        <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {offer.interested.toString()} interested
        </span>
      </div>
      <p className="text-sm font-medium text-gray-800 mb-1">{offer.objective}</p>
      {offer.description && (
        <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
      )}
      {offer.location && (
        <p className="text-xs text-gray-500 mb-2">📍 {offer.location}</p>
      )}
      <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-100">
        <span>Created {formattedDate}</span>
        <span>by {shortAddress}</span>
      </div>
      {showInterestButton && onExpressInterest && (
        <button
          onClick={() => onExpressInterest(offer.id)}
          disabled={isPending}
          className="mt-3 w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isPending ? "Confirming..." : "Express Interest"}
        </button>
      )}
    </div>
  );
}
