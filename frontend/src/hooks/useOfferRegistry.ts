"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { OFFER_REGISTRY_ADDRESS, OFFER_REGISTRY_ABI } from "@/lib/contracts";

export function useRegisterBusiness() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = () => {
    writeContract({
      address: OFFER_REGISTRY_ADDRESS,
      abi: OFFER_REGISTRY_ABI,
      functionName: "registerBusiness",
    });
  };

  return { register, isPending, isConfirming, isSuccess, error };
}

export function useRegisterInstitution() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = () => {
    writeContract({
      address: OFFER_REGISTRY_ADDRESS,
      abi: OFFER_REGISTRY_ABI,
      functionName: "registerInstitution",
    });
  };

  return { register, isPending, isConfirming, isSuccess, error };
}

export function useIsBusiness(address: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: OFFER_REGISTRY_ADDRESS,
    abi: OFFER_REGISTRY_ABI,
    functionName: "isBusiness",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  return { isBusiness: data as boolean | undefined, isLoading };
}

export function useIsInstitution(address: `0x${string}` | undefined) {
  const { data, isLoading } = useReadContract({
    address: OFFER_REGISTRY_ADDRESS,
    abi: OFFER_REGISTRY_ABI,
    functionName: "isInstitution",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  return { isInstitution: data as boolean | undefined, isLoading };
}

export function useCreateOfferOnChain() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createOffer = (contentHash: `0x${string}`, category: number, expiresAt: bigint) => {
    writeContract({
      address: OFFER_REGISTRY_ADDRESS,
      abi: OFFER_REGISTRY_ABI,
      functionName: "createOffer",
      args: [contentHash, category, expiresAt],
    });
  };

  return { createOffer, isPending, isConfirming, isSuccess, hash, error };
}

export function useExpressInterest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const expressInterest = (offerId: bigint) => {
    writeContract({
      address: OFFER_REGISTRY_ADDRESS,
      abi: OFFER_REGISTRY_ABI,
      functionName: "expressInterest",
      args: [offerId],
    });
  };

  return { expressInterest, isPending, isConfirming, isSuccess, error };
}

export function useCancelOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelOffer = (offerId: bigint) => {
    writeContract({
      address: OFFER_REGISTRY_ADDRESS,
      abi: OFFER_REGISTRY_ABI,
      functionName: "cancelOffer",
      args: [offerId],
    });
  };

  return { cancelOffer, isPending, isConfirming, isSuccess, error };
}
