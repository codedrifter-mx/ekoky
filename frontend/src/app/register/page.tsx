"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

type Role = "BUSINESS" | "INSTITUTION";

export default function RegisterPage() {
  const router = useRouter();
  const { authenticated, hasProfile } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (hasProfile) {
      router.push("/dashboard");
    }
  }, [hasProfile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name.trim()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      await api.post("/api/users", {
        role,
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
      });

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create profile. Please try again.";
      setApiError(message);
      setSubmitting(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h1 className="font-serif text-4xl">Create your profile</h1>
        <p className="text-muted">Please sign in first to create a profile.</p>
        <Link
          href="/login"
          className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl">Create your profile</h1>
        <p className="text-muted">
          Tell us who you are and how you want to participate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-[8px] overflow-hidden">
        <button
          type="button"
          onClick={() => setRole("BUSINESS")}
          className={`p-8 text-left transition-colors ${
            role === "BUSINESS"
              ? "bg-surface"
              : "bg-surface-alt hover:bg-surface"
          }`}
          style={role === "BUSINESS" ? { boxShadow: "inset 0 0 0 2px #111111" } : undefined}
        >
          <h3 className="text-lg font-semibold mb-2">Business</h3>
          <p className="text-muted text-sm leading-relaxed">
            I have surplus food to donate or sell at a discount.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRole("INSTITUTION")}
          className={`p-8 text-left transition-colors ${
            role === "INSTITUTION"
              ? "bg-surface"
              : "bg-surface-alt hover:bg-surface"
          }`}
          style={role === "INSTITUTION" ? { boxShadow: "inset 0 0 0 2px #111111" } : undefined}
        >
          <h3 className="text-lg font-semibold mb-2">Institution</h3>
          <p className="text-muted text-sm leading-relaxed">
            I collect and redistribute food to those in need.
          </p>
        </button>
      </div>

      {role && (
        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-[8px] p-8 space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2"
            >
              Name <span className="text-pale-red-text">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your organization name"
              className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your organization"
              rows={3}
              className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-2"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full border border-border bg-surface rounded-[4px] px-4 py-2.5 text-sm focus:border-accent"
            />
          </div>

          {apiError && (
            <div className="bg-pale-red-bg/50 border border-pale-red-bg rounded-[4px] p-3">
              <p className="text-pale-red-text text-xs font-mono">{apiError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full bg-accent text-white py-3 px-6 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
          >
            {submitting ? "Creating profile..." : "Create Profile"}
          </button>
        </form>
      )}
    </div>
  );
}