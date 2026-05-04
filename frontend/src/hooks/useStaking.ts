"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { STAKING_ADDRESS, STAKING_ABI } from "@/lib/contracts";
import { formatUnits, parseUnits } from "viem";

export function useStakingInfo(address: `0x${string}` | undefined) {
  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "totalStaked",
  });

  const { data: stakedBalance } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "stakedBalance",
    args: address ? [address] : undefined,
  });

  const { data: earnedRewards } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "earned",
    args: address ? [address] : undefined,
  });

  const { data: rewardRate } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: "rewardRate",
  });

  return {
    totalStaked: totalStaked as bigint | undefined,
    totalStakedFormatted: totalStaked ? formatUnits(totalStaked as bigint, 18) : "0",
    stakedBalance: stakedBalance as bigint | undefined,
    stakedBalanceFormatted: stakedBalance ? formatUnits(stakedBalance as bigint, 18) : "0",
    earnedRewards: earnedRewards as bigint | undefined,
    earnedRewardsFormatted: earnedRewards ? formatUnits(earnedRewards as bigint, 18) : "0",
    rewardRate: rewardRate as bigint | undefined,
  };
}

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const stake = (amount: string) => {
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: "stake",
      args: [parseUnits(amount, 18)],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { stake, isPending, isConfirming, isSuccess, hash, error };
}

export function useUnstake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const unstake = (amount: string) => {
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: "unstake",
      args: [parseUnits(amount, 18)],
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { unstake, isPending, isConfirming, isSuccess, hash, error };
}

export function useClaimRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const claimRewards = () => {
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: "claimRewards",
    });
  };

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return { claimRewards, isPending, isConfirming, isSuccess, hash, error };
}
