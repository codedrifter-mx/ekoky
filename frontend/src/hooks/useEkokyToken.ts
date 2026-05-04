"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { EKOKY_TOKEN_ADDRESS, EKOKY_TOKEN_ABI } from "@/lib/contracts";
import { formatUnits, parseUnits } from "viem";

export function useTokenBalance(address: `0x${string}` | undefined) {
  const { data, ...rest } = useReadContract({
    address: EKOKY_TOKEN_ADDRESS,
    abi: EKOKY_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  return {
    balance: data as bigint | undefined,
    formatted: data ? formatUnits(data as bigint, 18) : "0",
    ...rest,
  };
}

export function useTokenInfo() {
  const { data: name } = useReadContract({
    address: EKOKY_TOKEN_ADDRESS,
    abi: EKOKY_TOKEN_ABI,
    functionName: "name",
  });

  const { data: symbol } = useReadContract({
    address: EKOKY_TOKEN_ADDRESS,
    abi: EKOKY_TOKEN_ABI,
    functionName: "symbol",
  });

  const { data: totalSupply } = useReadContract({
    address: EKOKY_TOKEN_ADDRESS,
    abi: EKOKY_TOKEN_ABI,
    functionName: "totalSupply",
  });

  return {
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    totalSupply: totalSupply as bigint | undefined,
  };
}

export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const approve = (spender: `0x${string}`, amount: string) => {
    writeContract({
      address: EKOKY_TOKEN_ADDRESS,
      abi: EKOKY_TOKEN_ABI,
      functionName: "approve",
      args: [spender, parseUnits(amount, 18)],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { approve, isPending, isConfirming, isSuccess, hash, error };
}

export function useTransferToken() {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const transfer = (to: `0x${string}`, amount: string) => {
    writeContract({
      address: EKOKY_TOKEN_ADDRESS,
      abi: EKOKY_TOKEN_ABI,
      functionName: "transfer",
      args: [to, parseUnits(amount, 18)],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { transfer, isPending, isConfirming, isSuccess, hash };
}
