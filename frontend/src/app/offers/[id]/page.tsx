"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { InterestList, InterestItem } from "@/components/InterestList";
import { OfferCategory, OfferStatus } from "@/components/OfferCard";
import { MessageThread } from "@/components/MessageThread";

interface OfferDetail {
  id: string;
  category: OfferCategory;
  title: string;
  description: string;
  quantity: string | null;
  pickupAddress: string | null;
  status: OfferStatus;
  expiresAt: string;
  createdAt: string;
  creator: { id: string; name: string; address: string; role: string };
  interests: InterestItem[];
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

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticated, hasProfile, role, address } = useAuth();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState("");
  const [expressing, setExpressing] = useState(false);
  const [expressError, setExpressError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [updatingInterestId, setUpdatingInterestId] = useState<string | null>(
    null
  );

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    async function fetchOffer() {
      try {
        const data = await api.get<OfferDetail>(`/api/offers/${id}`);
        setOffer(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load offer"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchOffer();
  }, [id]);

  const isOwner = offer
    ? offer.creator.address.toLowerCase() === address?.toLowerCase()
    : false;
  const isExpired = offer ? new Date(offer.expiresAt) < new Date() : false;
  const hasExpressedInterest =
    offer && address
      ? offer.interests.some(
          (i) =>
            i.institution.address.toLowerCase() === address.toLowerCase()
        )
      : false;

  const acceptedInterest = offer?.interests.find(
    (i) => i.status === "ACCEPTED"
  );
  const isAcceptedInstitution =
    acceptedInterest && address
      ? acceptedInterest.institution.address.toLowerCase() ===
        address.toLowerCase()
      : false;
  const canMessage = isOwner || isAcceptedInstitution;
  const receiverId = isOwner
    ? acceptedInterest?.institution.id
    : isAcceptedInstitution
      ? offer?.creator.id
      : undefined;

  const handleCancel = async () => {
    if (!offer) return;
    setCancelling(true);
    try {
      await api.delete(`/api/offers/${offer.id}`);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel offer"
      );
      setCancelling(false);
    }
  };

  const handleExpressInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer) return;
    setExpressing(true);
    setExpressError(null);
    try {
      await api.post("/api/interests", {
        offerId: offer.id,
        message: interestMessage.trim() || undefined,
      });
      const data = await api.get<OfferDetail>(`/api/offers/${offer.id}`);
      setOffer(data);
      setInterestMessage("");
    } catch (err) {
      setExpressError(
        err instanceof Error ? err.message : "Failed to express interest"
      );
    } finally {
      setExpressing(false);
    }
  };

  const handleUpdateInterest = async (
    interestId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    setUpdatingInterestId(interestId);
    try {
      await api.patch("/api/interests", { interestId, status });
      const data = await api.get<OfferDetail>(`/api/offers/${id}`);
      setOffer(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update interest"
      );
    } finally {
      setUpdatingInterestId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  if (error) return <p className="text-red-600">{error}</p>;
  if (!offer) return <p className="text-gray-500">Offer not found.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div className="flex flex-wrap gap-2">
        <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {categoryLabels[offer.category]}
        </span>
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusColors[offer.status]}`}
        >
          {offer.status.replace("_", " ")}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-green-600">{offer.title}</h1>
      <p className="text-gray-600">{offer.description}</p>

      <div className="bg-white rounded-lg shadow-md border p-6 space-y-3">
        {offer.quantity && (
          <p className="text-gray-700">
            <span className="font-medium">Quantity:</span> {offer.quantity}
          </p>
        )}
        {offer.pickupAddress && (
          <p className="text-gray-700">
            <span className="font-medium">Pickup Address:</span>{" "}
            {offer.pickupAddress}
          </p>
        )}
        <p className="text-gray-700">
          <span className="font-medium">Expires:</span>{" "}
          {new Date(offer.expiresAt).toLocaleString()}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Posted:</span>{" "}
          {new Date(offer.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Posted by:</span> {offer.creator.name}
        </p>
      </div>

      {isOwner && offer.status === "ACTIVE" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
        >
          {cancelling ? "Cancelling..." : "Cancel Offer"}
        </button>
      )}

      {authenticated &&
        hasProfile &&
        role === "INSTITUTION" &&
        offer.status === "ACTIVE" &&
        !isExpired && (
          <div className="bg-white rounded-lg shadow-md border p-6">
            {hasExpressedInterest ? (
              <p className="text-green-700 font-medium">
                You have already expressed interest in this offer.
              </p>
            ) : (
              <form onSubmit={handleExpressInterest} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Express Interest
                </h3>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    value={interestMessage}
                    onChange={(e) => setInterestMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Add a message to the business..."
                  />
                </div>
                {expressError && (
                  <p className="text-red-600 text-sm">{expressError}</p>
                )}
                <button
                  type="submit"
                  disabled={expressing}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition"
                >
                  {expressing ? "Submitting..." : "Express Interest"}
                </button>
              </form>
            )}
          </div>
        )}

      {isOwner && offer.interests.length > 0 && (
        <InterestList
          interests={offer.interests}
          isOwner={isOwner}
          onUpdateStatus={handleUpdateInterest}
          updatingId={updatingInterestId}
        />
      )}

      {(offer.status === "PENDING_FULFILLMENT" || offer.status === "FULFILLED") &&
        canMessage &&
        receiverId && (
          <MessageThread offerId={offer.id} receiverId={receiverId} />
        )}

      <div className="pt-4">
        <Link
          href="/explore"
          className="text-green-600 hover:underline font-medium"
        >
          &larr; Back to Explore
        </Link>
      </div>
    </div>
  );
}
