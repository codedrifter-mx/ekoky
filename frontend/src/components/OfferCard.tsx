"use client";

import Link from "next/link";

export type OfferCategory =
  | "PRODUCE"
  | "DAIRY"
  | "BAKERY"
  | "PREPARED"
  | "PACKAGED"
  | "BEVERAGES"
  | "MIXED";

export type OfferStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "PENDING_FULFILLMENT"
  | "FULFILLED"
  | "EXPIRED";

export interface OfferCardData {
  id: string;
  category: OfferCategory;
  title: string;
  description: string;
  quantity: string | null;
  pickupAddress: string | null;
  status: OfferStatus;
  expiresAt: string;
  createdAt: string;
  creator: { name: string; address?: string };
  interests?: { id: string }[];
}

interface OfferCardProps {
  offer: OfferCardData;
}

const categoryLabels: Record<OfferCategory, string> = {
  PRODUCE: "Produce",
  DAIRY: "Dairy",
  BAKERY: "Bakery",
  PREPARED: "Prepared",
  PACKAGED: "Packaged",
  BEVERAGES: "Beverages",
  MIXED: "Mixed",
};

const statusColors: Record<OfferStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  PENDING_FULFILLMENT: "bg-yellow-100 text-yellow-800",
  FULFILLED: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

function isExpiringSoon(expiresAt: string): boolean {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diff = expires.getTime() - now.getTime();
  return diff > 0 && diff < 24 * 60 * 60 * 1000;
}

export function OfferCard({ offer }: OfferCardProps) {
  const interestCount = offer.interests?.length ?? 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {categoryLabels[offer.category]}
        </span>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusColors[offer.status]}`}
        >
          {offer.status.replace("_", " ")}
        </span>
        {isExpiringSoon(offer.expiresAt) && (
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Expires soon
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-green-700 mb-2">
        <Link href={`/offers/${offer.id}`} className="hover:underline">
          {offer.title}
        </Link>
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {offer.description}
      </p>
      {offer.quantity && (
        <p className="text-sm text-gray-700 mb-1">
          <span className="font-medium">Quantity:</span> {offer.quantity}
        </p>
      )}
      {offer.pickupAddress && (
        <p className="text-sm text-gray-700 mb-1">
          <span className="font-medium">Pickup:</span> {offer.pickupAddress}
        </p>
      )}
      <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-100 mt-3">
        <span>by {offer.creator.name}</span>
        <span>{interestCount} interested</span>
      </div>
    </div>
  );
}
