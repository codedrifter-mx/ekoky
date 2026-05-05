"use client";

import { useAccount, useReadContract } from "wagmi";
import { useTokenBalance, useApproveToken } from "@/hooks/useEkokyToken";
import { useStakingInfo, useStake, useUnstake, useClaimRewards } from "@/hooks/useStaking";
import { EKOKY_TOKEN_ADDRESS, EKOKY_TOKEN_ABI, STAKING_ADDRESS } from "@/lib/contracts";
import { useState, useCallback } from "react";
import { formatUnits, parseUnits } from "viem";

function formatMax(amount: string) {
  const num = Number(amount);
  if (num === 0) return "0";
  if (num < 0.0001) return amount;
  return num.toFixed(6).replace(/\.?0+$/, "");
}

export function StakeForm() {
  const { address, isConnected } = useAccount();
  const { formatted: balanceFormatted } = useTokenBalance(address);
  const {
    stakedBalanceFormatted,
    earnedRewardsFormatted,
    totalStakedFormatted,
  } = useStakingInfo(address);

  const { data: allowanceRaw } = useReadContract({
    address: EKOKY_TOKEN_ADDRESS,
    abi: EKOKY_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, STAKING_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { approve, isPending: isApproving, isConfirming: isApproveConfirming, isSuccess: isApproveSuccess, error: approveError } = useApproveToken();
  const { stake, isPending: isStakingPending, isConfirming: isStakeConfirming, isSuccess: isStakeSuccess, error: stakeError } = useStake();
  const { unstake, isPending: isUnstakingPending, isConfirming: isUnstakeConfirming, isSuccess: isUnstakeSuccess, error: unstakeError } = useUnstake();
  const { claimRewards, isPending: isClaimingPending, isConfirming: isClaimConfirming, isSuccess: isClaimSuccess, error: claimError } = useClaimRewards();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const allowance = allowanceRaw ? (allowanceRaw as bigint) : BigInt(0);
  const stakeAmountParsed = stakeAmount ? parseUnits(stakeAmount, 18) : BigInt(0);
  const needsApproval = stakeAmountParsed > BigInt(0) && allowance < stakeAmountParsed;

  const handleApprove = useCallback(() => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    approve(STAKING_ADDRESS, stakeAmount);
  }, [stakeAmount, approve]);

  const handleStake = useCallback(() => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    stake(stakeAmount);
  }, [stakeAmount, stake]);

  const handleUnstake = useCallback(() => {
    if (!unstakeAmount || Number(unstakeAmount) <= 0) return;
    unstake(unstakeAmount);
  }, [unstakeAmount, unstake]);

  const stakeLoading = isApproving || isApproveConfirming || isStakingPending || isStakeConfirming;
  const unstakeLoading = isUnstakingPending || isUnstakeConfirming;
  const claimLoading = isClaimingPending || isClaimConfirming;

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Connect your wallet to stake EKY tokens.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="text-xl font-bold text-green-600">{Number(balanceFormatted).toFixed(4)} EKY</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Staked</p>
          <p className="text-xl font-bold text-blue-600">{Number(stakedBalanceFormatted).toFixed(4)} EKY</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Earned Rewards</p>
          <p className="text-xl font-bold text-amber-600">{Number(earnedRewardsFormatted).toFixed(6)} EKY</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Total Staked (Protocol)</p>
          <p className="text-xl font-bold text-gray-600">{Number(totalStakedFormatted).toFixed(2)} EKY</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Stake EKY Tokens</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Amount to stake"
            min="0"
            step="0.01"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => setStakeAmount(formatMax(balanceFormatted))}
            className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
          >
            MAX
          </button>
        </div>

        {needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={stakeLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isApproving || isApproveConfirming ? "Approving..." : "Approve EKY"}
          </button>
        ) : (
          <button
            onClick={handleStake}
            disabled={stakeLoading || !stakeAmount || Number(stakeAmount) <= 0}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {isStakingPending || isStakeConfirming ? "Staking..." : "Stake"}
          </button>
        )}

        {isApproveSuccess && (
          <p className="mt-2 text-blue-600 text-sm">Approval confirmed! You can now stake.</p>
        )}
        {isStakeSuccess && (
          <p className="mt-2 text-green-600 text-sm">Successfully staked!</p>
        )}
        {(approveError || stakeError) && (
          <p className="mt-2 text-red-600 text-sm">
            Error: {(approveError || stakeError)?.message || "Transaction failed"}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Unstake EKY Tokens</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            placeholder="Amount to unstake"
            min="0"
            step="0.01"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => setUnstakeAmount(formatMax(stakedBalanceFormatted))}
            className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
          >
            MAX
          </button>
        </div>
        <button
          onClick={handleUnstake}
          disabled={unstakeLoading || !unstakeAmount || Number(unstakeAmount) <= 0}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 transition"
        >
          {isUnstakingPending || isUnstakeConfirming ? "Unstaking..." : "Unstake"}
        </button>
        {isUnstakeSuccess && <p className="mt-2 text-green-600 text-sm">Successfully unstaked!</p>}
        {unstakeError && (
          <p className="mt-2 text-red-600 text-sm">
            Error: {unstakeError.message || "Transaction failed"}
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Claim Rewards</h3>
            <p className="text-gray-500 text-sm">{Number(earnedRewardsFormatted).toFixed(6)} EKY available</p>
          </div>
          <button
            onClick={() => claimRewards()}
            disabled={claimLoading || Number(earnedRewardsFormatted) === 0}
            className="bg-amber-500 text-white py-2 px-6 rounded hover:bg-amber-600 disabled:bg-gray-400 transition"
          >
            {isClaimingPending || isClaimConfirming ? "Claiming..." : "Claim Rewards"}
          </button>
        </div>
        {isClaimSuccess && <p className="mt-2 text-green-600 text-sm">Rewards claimed!</p>}
        {claimError && (
          <p className="mt-2 text-red-600 text-sm">
            Error: {claimError.message || "Transaction failed"}
          </p>
        )}
      </div>
    </div>
  );
}
