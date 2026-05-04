"use client";

import { useAccount } from "wagmi";
import { useTokenBalance, useApproveToken } from "@/hooks/useEkokyToken";
import { useStakingInfo, useStake, useUnstake, useClaimRewards } from "@/hooks/useStaking";
import { STAKING_ADDRESS } from "@/lib/contracts";
import { useState, useEffect } from "react";

export function StakeForm() {
  const { address, isConnected } = useAccount();
  const { formatted: balanceFormatted } = useTokenBalance(address);
  const {
    stakedBalanceFormatted,
    earnedRewardsFormatted,
    totalStakedFormatted,
  } = useStakingInfo(address);
  const { approve, isPending: isApproving, isSuccess: isApproveSuccess } = useApproveToken();
  const { stake, isPending: isStakingPending, isSuccess: isStakeSuccess } = useStake();
  const { unstake, isPending: isUnstakingPending, isSuccess: isUnstakeSuccess } = useUnstake();
  const { claimRewards, isPending: isClaimingPending, isSuccess: isClaimSuccess } = useClaimRewards();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const handleStake = () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) return;
    approve(STAKING_ADDRESS, stakeAmount);
  };

  useEffect(() => {
    if (isApproveSuccess && stakeAmount) {
      stake(stakeAmount);
    }
  }, [isApproveSuccess]);

  const handleUnstake = () => {
    if (!unstakeAmount || Number(unstakeAmount) <= 0) return;
    unstake(unstakeAmount);
  };

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
          <p className="text-xl font-bold text-green-600">{Number(balanceFormatted).toFixed(2)} EKY</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Staked</p>
          <p className="text-xl font-bold text-blue-600">{Number(stakedBalanceFormatted).toFixed(4)} EKY</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Earned Rewards</p>
          <p className="text-xl font-bold text-amber-600">{Number(earnedRewardsFormatted).toFixed(4)} EKY</p>
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
            onClick={() => setStakeAmount(balanceFormatted)}
            className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
          >
            MAX
          </button>
        </div>
        <button
          onClick={handleStake}
          disabled={isApproving || isStakingPending}
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          {isApproving ? "Approving..." : isStakingPending ? "Staking..." : "Stake"}
        </button>
        {isStakeSuccess && <p className="mt-2 text-green-600 text-sm">Successfully staked!</p>}
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
            onClick={() => setUnstakeAmount(stakedBalanceFormatted)}
            className="bg-gray-200 px-3 py-2 rounded text-sm hover:bg-gray-300"
          >
            MAX
          </button>
        </div>
        <button
          onClick={handleUnstake}
          disabled={isUnstakingPending}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 transition"
        >
          {isUnstakingPending ? "Unstaking..." : "Unstake"}
        </button>
        {isUnstakeSuccess && <p className="mt-2 text-green-600 text-sm">Successfully unstaked!</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Claim Rewards</h3>
            <p className="text-gray-500 text-sm">{Number(earnedRewardsFormatted).toFixed(4)} EKY available</p>
          </div>
          <button
            onClick={() => claimRewards()}
            disabled={isClaimingPending || Number(earnedRewardsFormatted) === 0}
            className="bg-amber-500 text-white py-2 px-6 rounded hover:bg-amber-600 disabled:bg-gray-400 transition"
          >
            {isClaimingPending ? "Claiming..." : "Claim Rewards"}
          </button>
        </div>
        {isClaimSuccess && <p className="mt-2 text-green-600 text-sm">Rewards claimed!</p>}
      </div>
    </div>
  );
}
