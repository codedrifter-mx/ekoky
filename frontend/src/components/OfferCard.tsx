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

const statusStyles: Record<OfferStatus, string> = {
  ACTIVE: "bg-pale-green-bg text-pale-green-text",
  CANCELLED: "bg-pale-red-bg text-pale-red-text",
  PENDING_FULFILLMENT: "bg-pale-yellow-bg text-pale-yellow-text",
  FULFILLED: "bg-pale-blue-bg text-pale-blue-text",
  EXPIRED: "bg-surface-alt text-muted",
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
    <Link href={`/offers/${offer.id}`} className="block group">
      <div className="bg-surface border border-border p-6 rounded-[8px] transition-shadow group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-pale-teal-bg text-pale-teal-text text-[10px] font-mono uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-[4px]">
            {categoryLabels[offer.category]}
          </span>
          <span className={`text-[10px] font-mono uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-[4px] ${statusStyles[offer.status]}`}>
            {offer.status.replace("_", " ")}
          </span>
          {isExpiringSoon(offer.expiresAt) && (
            <span className="bg-pale-yellow-bg text-pale-yellow-text text-[10px] font-mono uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-[4px]">
              Expires soon
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold mb-2 group-hover:text-muted transition-colors">
          {offer.title}
        </h3>
        <p className="text-sm text-muted mb-4 line-clamp-2 leading-relaxed">
          {offer.description}
        </p>
        {offer.quantity && (
          <p className="text-sm text-foreground mb-1">
            <span className="text-muted">Quantity:</span> {offer.quantity}
          </p>
        )}
        {offer.pickupAddress && (
          <p className="text-sm text-foreground mb-1">
            <span className="text-muted">Pickup:</span> {offer.pickupAddress}
          </p>
        )}
        <div className="flex justify-between items-center text-xs text-muted pt-4 border-t border-border mt-4 font-mono">
          <span>{offer.creator.name}</span>
          <span>{interestCount} interested</span>
        </div>
      </div>
    </Link>
  );
}