"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRegisterBusiness, useRegisterInstitution } from "@/hooks/useOfferRegistry";
import { api } from "@/lib/api";

type Role = "BUSINESS" | "INSTITUTION";

export default function RegisterPage() {
  const router = useRouter();
  const { authenticated, hasProfile } = useAuth();
  const {
    register: registerBusiness,
    isPending: isBusinessPending,
    isSuccess: isBusinessSuccess,
    error: businessError,
  } = useRegisterBusiness();
  const {
    register: registerInstitution,
    isPending: isInstitutionPending,
    isSuccess: isInstitutionSuccess,
    error: institutionError,
  } = useRegisterInstitution();

  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [awaitingTx, setAwaitingTx] = useState(false);

  useEffect(() => {
    if (hasProfile) {
      router.push("/dashboard");
    }
  }, [hasProfile, router]);

  useEffect(() => {
    if (awaitingTx) {
      if (
        (role === "BUSINESS" && isBusinessSuccess) ||
        (role === "INSTITUTION" && isInstitutionSuccess)
      ) {
        router.push("/dashboard");
      }
    }
  }, [awaitingTx, isBusinessSuccess, isInstitutionSuccess, role, router]);

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

      setSubmitting(false);

      if (role === "BUSINESS") {
        registerBusiness();
      } else {
        registerInstitution();
      }
      setAwaitingTx(true);
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
        <h1 className="text-3xl font-bold text-green-600">Create your profile</h1>
        <p className="text-gray-600">Please sign in first to create a profile.</p>
        <Link
          href="/login"
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-green-600">Create your profile</h1>
        <p className="text-gray-600">
          Tell us who you are and how you want to participate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setRole("BUSINESS")}
          className={`p-6 rounded-lg border-2 text-left transition ${
            role === "BUSINESS"
              ? "border-green-600 bg-green-50"
              : "border-gray-200 bg-white hover:border-green-300"
          }`}
        >
          <h3 className="text-xl font-bold text-green-700 mb-2">Business</h3>
          <p className="text-gray-600 text-sm">
            I have surplus food to donate or sell at a discount.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setRole("INSTITUTION")}
          className={`p-6 rounded-lg border-2 text-left transition ${
            role === "INSTITUTION"
              ? "border-teal-600 bg-teal-50"
              : "border-gray-200 bg-white hover:border-teal-300"
          }`}
        >
          <h3 className="text-xl font-bold text-teal-700 mb-2">Institution</h3>
          <p className="text-gray-600 text-sm">
            I collect and redistribute food to those in need.
          </p>
        </button>
      </div>

      {role && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md border space-y-6"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your organization name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your organization"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          )}

          {(businessError || institutionError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                On-chain registration failed:{" "}
                {(businessError || institutionError)?.message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting || isBusinessPending || isInstitutionPending || !name.trim()
            }
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
          >
            {submitting
              ? "Creating profile..."
              : isBusinessPending || isInstitutionPending
              ? "Confirming on-chain..."
              : "Create Profile"}
          </button>
        </form>
      )}
    </div>
  );
}
