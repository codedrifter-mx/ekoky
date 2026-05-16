"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useIsInstitution, useRegisterInstitution } from "@/hooks/useOfferRegistry";
import { useAccount } from "wagmi";
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

const statusStyles: Record<OfferStatus, string> = {
  ACTIVE: "bg-pale-green-bg text-pale-green-text",
  CANCELLED: "bg-pale-red-bg text-pale-red-text",
  PENDING_FULFILLMENT: "bg-pale-yellow-bg text-pale-yellow-text",
  FULFILLED: "bg-pale-blue-bg text-pale-blue-text",
  EXPIRED: "bg-surface-alt text-muted",
};

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticated, hasProfile, role, address } = useAuth();
  const { address: walletAddress, isConnected } = useAccount();
  const { isInstitution, isLoading: checkingInstitution } = useIsInstitution(walletAddress);
  const {
    register: registerInstitution,
    isPending: registering,
    isSuccess: registered,
  } = useRegisterInstitution();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestMessage, setInterestMessage] = useState("");
  const [expressing, setExpressing] = useState(false);
  const [expressError, setExpressError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [updatingInterestId, setUpdatingInterestId] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    async function fetchOffer() {
      try {
        const data = await api.get<OfferDetail>(`/api/offers/${id}`);
        setOffer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load offer");
      } finally {
        setLoading(false);
      }
    }
    fetchOffer();
  }, [id]);

  const isOwner = offer ? offer.creator.address.toLowerCase() === address?.toLowerCase() : false;
  const isExpired = offer ? new Date(offer.expiresAt) < new Date() : false;
  const hasExpressedInterest = offer && address
    ? offer.interests.some((i) => i.institution.address.toLowerCase() === address.toLowerCase())
    : false;

  const acceptedInterest = offer?.interests.find((i) => i.status === "ACCEPTED");
  const isAcceptedInstitution = acceptedInterest && address
    ? acceptedInterest.institution.address.toLowerCase() === address.toLowerCase()
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
      setError(err instanceof Error ? err.message : "Failed to cancel offer");
      setCancelling(false);
    }
  };

  const handleExpressInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer) return;
    setExpressing(true);
    setExpressError(null);
    try {
      await api.post("/api/interests", { offerId: offer.id, message: interestMessage.trim() || undefined });
      const data = await api.get<OfferDetail>(`/api/offers/${offer.id}`);
      setOffer(data);
      setInterestMessage("");
    } catch (err) {
      setExpressError(err instanceof Error ? err.message : "Failed to express interest");
    } finally {
      setExpressing(false);
    }
  };

  const handleUpdateInterest = async (interestId: string, status: "ACCEPTED" | "REJECTED") => {
    setUpdatingInterestId(interestId);
    try {
      await api.patch("/api/interests", { interestId, status });
      const data = await api.get<OfferDetail>(`/api/offers/${id}`);
      setOffer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update interest");
    } finally {
      setUpdatingInterestId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-muted font-mono text-sm">Loading...</p></div>;
  if (error) return <p className="text-pale-red-text text-sm font-mono">{error}</p>;
  if (!offer) return <p className="text-muted">Offer not found.</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <div className="flex flex-wrap gap-2">
        <span className="bg-pale-teal-bg text-pale-teal-text text-[10px] font-mono uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-[4px]">
          {categoryLabels[offer.category]}
        </span>
        <span className={`text-[10px] font-mono uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-[4px] ${statusStyles[offer.status]}`}>
          {offer.status.replace("_", " ")}
        </span>
      </div>

      <h1 className="font-serif text-4xl">{offer.title}</h1>
      <p className="text-muted leading-relaxed">{offer.description}</p>

      <div className="border border-border rounded-[8px] p-6 space-y-3">
        {offer.quantity && (
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted text-sm">Quantity</span>
            <span className="text-sm font-medium">{offer.quantity}</span>
          </div>
        )}
        {offer.pickupAddress && (
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted text-sm">Pickup Address</span>
            <span className="text-sm font-medium">{offer.pickupAddress}</span>
          </div>
        )}
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted text-sm">Expires</span>
          <span className="text-sm font-mono">{new Date(offer.expiresAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted text-sm">Posted</span>
          <span className="text-sm font-mono">{new Date(offer.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-muted text-sm">Posted by</span>
          <span className="text-sm font-medium">{offer.creator.name}</span>
        </div>
      </div>

      {isOwner && offer.status === "ACTIVE" && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="border border-pale-red-bg text-pale-red-text px-4 py-2 rounded-[4px] hover:bg-pale-red-bg/30 disabled:opacity-40 transition-colors text-sm font-medium tracking-wide"
        >
          {cancelling ? "Cancelling..." : "Cancel Offer"}
        </button>
      )}

      {authenticated && hasProfile && role === "INSTITUTION" && offer.status === "ACTIVE" && !isExpired && (
        <div className="border border-border rounded-[8px] p-6">
          {checkingInstitution ? (
            <p className="text-muted font-mono text-sm">Checking on-chain registration...</p>
          ) : !isInstitution ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">On-chain Registration Required</h3>
              <p className="text-muted text-sm leading-relaxed">
                Before expressing interest, you need to register your institution on the blockchain. This is a one-time transaction.
              </p>
              {!isConnected ? (
                <p className="text-pale-yellow-text text-sm">Please connect your wallet first.</p>
              ) : (
                <button
                  onClick={registerInstitution}
                  disabled={registering || registered}
                  className="bg-accent text-white px-4 py-2.5 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
                >
                  {registering ? "Confirming..." : registered ? "Registered" : "Register Institution On-chain"}
                </button>
              )}
              {registered && <p className="text-pale-green-text text-xs font-mono">Registration successful. You can now express interest.</p>}
            </div>
          ) : hasExpressedInterest ? (
            <p className="text-pale-green-text font-medium text-sm">
              You have already expressed interest in this offer.
            </p>
          ) : (
            <form onSubmit={handleExpressInterest} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider">Express Interest</h3>
              <div>
                <label htmlFor="message" className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2">Message (optional)</label>
                <textarea
                  id="message"
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  rows={3}
                  className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent resize-none"
                  placeholder="Add a message to the business..."
                />
              </div>
              {expressError && <p className="text-pale-red-text text-xs font-mono">{expressError}</p>}
              <button
                type="submit"
                disabled={expressing}
                className="bg-accent text-white px-4 py-2.5 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
              >
                {expressing ? "Submitting..." : "Express Interest"}
              </button>
            </form>
          )}
        </div>
      )}

      {isOwner && offer.interests.length > 0 && (
        <InterestList interests={offer.interests} isOwner={isOwner} onUpdateStatus={handleUpdateInterest} updatingId={updatingInterestId} />
      )}

      {(offer.status === "PENDING_FULFILLMENT" || offer.status === "FULFILLED") && canMessage && receiverId && (
        <MessageThread offerId={offer.id} receiverId={receiverId} />
      )}

      <div className="pt-4">
        <Link href="/explore" className="text-muted hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors">
          &larr; Back to Explore
        </Link>
      </div>
    </div>
  );
}