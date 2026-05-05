"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { useIsBusiness, useIsInstitution } from "@/hooks/useOfferRegistry";

export default function LoginPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { authenticated, hasProfile, loading, signIn } = useAuth();
  const { isBusiness, isLoading: isBusinessLoading } = useIsBusiness(address);
  const { isInstitution, isLoading: isInstitutionLoading } = useIsInstitution(address);

  useEffect(() => {
    if (authenticated && hasProfile) {
      router.push("/dashboard");
    }
  }, [authenticated, hasProfile, router]);

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-600">Sign in to Ekoky</h1>
        <p className="text-gray-600 max-w-md">
          Connect your wallet and authenticate with Ethereum to access the marketplace.
        </p>
      </div>

      {!isConnected && (
        <div className="flex flex-col items-center space-y-4">
          <ConnectButton />
        </div>
      )}

      {isConnected && (
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border text-center space-y-4">
            <p className="text-sm text-gray-500">Connected wallet</p>
            <p className="text-lg font-mono font-semibold text-gray-800">
              {truncatedAddress}
            </p>

            {isBusinessLoading || isInstitutionLoading ? (
              <p className="text-sm text-gray-400">Checking on-chain status...</p>
            ) : (
              <div className="space-y-1">
                {isBusiness && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Registered as Business
                  </span>
                )}
                {isInstitution && (
                  <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium">
                    Registered as Institution
                  </span>
                )}
                {!isBusiness && !isInstitution && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                    Not registered on-chain
                  </span>
                )}
              </div>
            )}
          </div>

          {!authenticated && (
            <button
              onClick={signIn}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
            >
              {loading ? "Signing in..." : "Sign in with Ethereum"}
            </button>
          )}

          {authenticated && !hasProfile && (
            <div className="text-center space-y-4">
              <p className="text-green-700 font-medium">Successfully authenticated!</p>
              <Link
                href="/register"
                className="block w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition font-semibold"
              >
                Create your profile
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
