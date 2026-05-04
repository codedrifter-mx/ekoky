"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { OFFER_MARKETPLACE_ADDRESS, OFFER_MARKETPLACE_ABI } from "@/lib/contracts";

export interface Offer {
  id: bigint;
  creator: `0x${string}`;
  name: string;
  objective: string;
  description: string;
  location: string;
  interested: bigint;
  createdAt: bigint;
}

export function useOffers() {
  const { data: offersCounter } = useReadContract({
    address: OFFER_MARKETPLACE_ADDRESS,
    abi: OFFER_MARKETPLACE_ABI,
    functionName: "offersCounter",
  });

  const { data: offers, ...rest } = useReadContract({
    address: OFFER_MARKETPLACE_ADDRESS,
    abi: OFFER_MARKETPLACE_ABI,
    functionName: "getAllOffers",
  });

  return {
    offersCounter: offersCounter as bigint | undefined,
    offers: (offers || []) as Offer[],
    ...rest,
  };
}

export function useOffer(offerId: bigint) {
  const { data, ...rest } = useReadContract({
    address: OFFER_MARKETPLACE_ADDRESS,
    abi: OFFER_MARKETPLACE_ABI,
    functionName: "getOffer",
    args: [offerId],
  });

  return {
    offer: data as Offer | undefined,
    ...rest,
  };
}

export function useCreateOffer() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createOffer = (name: string, objective: string, description: string, location: string) => {
    writeContract({
      address: OFFER_MARKETPLACE_ADDRESS,
      abi: OFFER_MARKETPLACE_ABI,
      functionName: "createOffer",
      args: [name, objective, description, location],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { createOffer, isPending, isConfirming, isSuccess, hash, error };
}

export function useExpressInterest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const expressInterest = (offerId: bigint) => {
    writeContract({
      address: OFFER_MARKETPLACE_ADDRESS,
      abi: OFFER_MARKETPLACE_ABI,
      functionName: "expressInterest",
      args: [offerId],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { expressInterest, isPending, isConfirming, isSuccess, hash, error };
}
