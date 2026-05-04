"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { createSiweMessage } from "@/lib/siwe";

interface AuthState {
  authenticated: boolean;
  address: string | null;
  hasProfile: boolean;
  role: "BUSINESS" | "INSTITUTION" | null;
  name: string | null;
}

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    address: null,
    hasProfile: false,
    role: null,
    name: null,
  });
  const [loading, setLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setAuthState({
          authenticated: data.authenticated,
          address: data.address,
          hasProfile: data.hasProfile,
          role: data.role,
          name: data.name,
        });
      } else {
        setAuthState({
          authenticated: false,
          address: null,
          hasProfile: false,
          role: null,
          name: null,
        });
      }
    } catch {
      setAuthState({
        authenticated: false,
        address: null,
        hasProfile: false,
        role: null,
        name: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = useCallback(async () => {
    if (!address || !isConnected) return;

    setLoading(true);
    try {
      const nonceRes = await fetch("/api/auth/challenge");
      const { nonce } = await nonceRes.json();

      const message = createSiweMessage(address, 31337, nonce);
      const signature = await signMessageAsync({ message });

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, signature }),
      });

      if (verifyRes.ok) {
        await checkAuth();
      }
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, signMessageAsync, checkAuth]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/me", { method: "DELETE" });
    setAuthState({
      authenticated: false,
      address: null,
      hasProfile: false,
      role: null,
      name: null,
    });
  }, []);

  return { ...authState, loading, signIn, signOut, checkAuth };
}
