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
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-5xl">Sign in to Ekoky</h1>
        <p className="text-muted max-w-md leading-relaxed">
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
          <div className="border border-border rounded-[8px] p-6 text-center space-y-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted">Connected wallet</p>
            <p className="text-lg font-mono font-semibold tracking-tight">
              {truncatedAddress}
            </p>

            {isBusinessLoading || isInstitutionLoading ? (
              <p className="text-xs font-mono text-muted">Checking on-chain status...</p>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                {isBusiness && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-[0.08em] font-medium bg-pale-green-bg text-pale-green-text">
                    Registered as Business
                  </span>
                )}
                {isInstitution && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-[0.08em] font-medium bg-pale-teal-bg text-pale-teal-text">
                    Registered as Institution
                  </span>
                )}
                {!isBusiness && !isInstitution && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-[0.08em] font-medium bg-surface-alt text-muted">
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
              className="w-full bg-accent text-white py-3 px-6 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
            >
              {loading ? "Signing in..." : "Sign in with Ethereum"}
            </button>
          )}

          {authenticated && !hasProfile && (
            <div className="text-center space-y-4">
              <p className="text-pale-green-text font-medium text-sm">Successfully authenticated.</p>
              <Link
                href="/register"
                className="block w-full bg-accent text-white py-3 px-6 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide text-center"
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