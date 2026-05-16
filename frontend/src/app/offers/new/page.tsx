"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useIsBusiness, useRegisterBusiness } from "@/hooks/useOfferRegistry";
import { useAccount } from "wagmi";
import { api } from "@/lib/api";

const CATEGORIES = [
  { value: "PRODUCE", label: "Produce" },
  { value: "DAIRY", label: "Dairy" },
  { value: "BAKERY", label: "Bakery" },
  { value: "PREPARED", label: "Prepared" },
  { value: "PACKAGED", label: "Packaged" },
  { value: "BEVERAGES", label: "Beverages" },
  { value: "MIXED", label: "Mixed" },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

export default function NewOfferPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { authenticated, hasProfile, role, loading: authLoading } = useAuth();
  const { isBusiness, isLoading: checkingBusiness } = useIsBusiness(address);
  const {
    register: registerBusiness,
    isPending: registering,
    isSuccess: registered,
  } = useRegisterBusiness();
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-muted font-mono text-sm">Loading...</p></div>;
  }

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="font-serif text-4xl">Create Offer</h1>
        <p className="text-muted">Please sign in to create an offer.</p>
        <Link href="/login" className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide">Sign In</Link>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="font-serif text-4xl">Create Offer</h1>
        <p className="text-muted">Please complete your profile first.</p>
        <Link href="/register" className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide">Create Profile</Link>
      </div>
    );
  }

  if (role !== "BUSINESS") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="font-serif text-4xl">Unauthorized</h1>
        <p className="text-muted">Only businesses can create offers.</p>
        <Link href="/dashboard" className="border border-border text-foreground px-8 py-3 rounded-[4px] hover:bg-surface-alt transition-colors text-sm font-medium tracking-wide">Back to Dashboard</Link>
      </div>
    );
  }

  if (checkingBusiness) {
    return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-muted font-mono text-sm">Checking on-chain registration...</p></div>;
  }

  if (!isBusiness) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8 text-center">
        <h1 className="font-serif text-4xl">On-chain Registration Required</h1>
        <p className="text-muted leading-relaxed">
          Before creating offers, you need to register your business on the blockchain. This is a one-time transaction.
        </p>
        {!isConnected ? (
          <p className="text-pale-yellow-text">Please connect your wallet first.</p>
        ) : (
          <button
            onClick={registerBusiness}
            disabled={registering || registered}
            className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
          >
            {registering ? "Confirming..." : registered ? "Registered" : "Register Business On-chain"}
          </button>
        )}
        {registered && <p className="text-pale-green-text text-sm font-mono">Registration successful. You can now create offers.</p>}
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !description.trim() || !expiresAt) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.post("/api/offers", {
        category,
        title: title.trim(),
        description: description.trim(),
        quantity: quantity.trim() || undefined,
        pickupAddress: pickupAddress.trim() || undefined,
        expiresAt: new Date(expiresAt).toISOString(),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create offer");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-8">
      <h1 className="font-serif text-4xl">Create New Offer</h1>
      <form onSubmit={handleSubmit} className="border border-border rounded-[8px] p-8 space-y-8">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-3">Category <span className="text-pale-red-text">*</span></label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border rounded-[8px] overflow-hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-4 text-center text-sm transition-colors ${
                  category === cat.value
                    ? "bg-surface font-medium"
                    : "bg-surface-alt text-muted hover:bg-surface"
                }`}
                style={category === cat.value ? { boxShadow: "inset 0 0 0 2px #111111" } : undefined}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2">Title <span className="text-pale-red-text">*</span></label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent" />
        </div>

        <div>
          <label htmlFor="description" className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2">Description <span className="text-pale-red-text">*</span></label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent resize-none" />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2">Quantity</label>
          <input id="quantity" type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 10 kg, 5 boxes" className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent" />
        </div>

        <div>
          <label htmlFor="pickupAddress" className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2">Pickup Address</label>
          <input id="pickupAddress" type="text" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent" />
        </div>

        <div>
          <label htmlFor="expiresAt" className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2">Expires At <span className="text-pale-red-text">*</span></label>
          <input id="expiresAt" type="datetime-local" value={expiresAt} min={minDate} onChange={(e) => setExpiresAt(e.target.value)} required className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent" />
        </div>

        {error && (
          <div className="bg-pale-red-bg/50 border border-pale-red-bg rounded-[4px] p-3">
            <p className="text-pale-red-text text-xs font-mono">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !category}
          className="w-full bg-accent text-white py-3 px-6 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
        >
          {submitting ? "Creating..." : "Create Offer"}
        </button>
      </form>
    </div>
  );
}