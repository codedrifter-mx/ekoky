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
      <div className="border border-border rounded-[8px] p-6 bg-pale-yellow-bg/30">
        <p className="text-pale-yellow-text text-sm">Connect your wallet to stake EKY tokens.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border rounded-[8px] overflow-hidden">
        <div className="bg-surface p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-1">Wallet Balance</p>
          <p className="text-lg font-semibold">{Number(balanceFormatted).toFixed(4)} <span className="text-xs text-muted font-mono">EKY</span></p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-1">Staked</p>
          <p className="text-lg font-semibold">{Number(stakedBalanceFormatted).toFixed(4)} <span className="text-xs text-muted font-mono">EKY</span></p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-1">Earned Rewards</p>
          <p className="text-lg font-semibold">{Number(earnedRewardsFormatted).toFixed(6)} <span className="text-xs text-muted font-mono">EKY</span></p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-1">Total Staked</p>
          <p className="text-lg font-semibold">{Number(totalStakedFormatted).toFixed(2)} <span className="text-xs text-muted font-mono">EKY</span></p>
        </div>
      </div>

      <div className="border border-border rounded-[8px] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Stake EKY Tokens</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Amount to stake"
            min="0"
            step="0.01"
            className="flex-1 border border-border bg-surface rounded-[4px] px-3 py-2 text-sm font-mono focus:border-accent"
          />
          <button
            onClick={() => setStakeAmount(formatMax(balanceFormatted))}
            className="bg-surface-alt border border-border px-3 py-2 rounded-[4px] text-xs font-mono uppercase tracking-wider hover:bg-border transition-colors"
          >
            MAX
          </button>
        </div>

        {needsApproval ? (
          <button
            onClick={handleApprove}
            disabled={stakeLoading}
            className="w-full bg-accent text-white py-2.5 px-4 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
          >
            {isApproving || isApproveConfirming ? "Approving..." : "Approve EKY"}
          </button>
        ) : (
          <button
            onClick={handleStake}
            disabled={stakeLoading || !stakeAmount || Number(stakeAmount) <= 0}
            className="w-full bg-accent text-white py-2.5 px-4 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
          >
            {isStakingPending || isStakeConfirming ? "Staking..." : "Stake"}
          </button>
        )}

        {isApproveSuccess && (
          <p className="mt-3 text-pale-blue-text text-xs font-mono">Approval confirmed. You can now stake.</p>
        )}
        {isStakeSuccess && (
          <p className="mt-3 text-pale-green-text text-xs font-mono">Successfully staked.</p>
        )}
        {(approveError || stakeError) && (
          <p className="mt-3 text-pale-red-text text-xs font-mono">
            Error: {(approveError || stakeError)?.message || "Transaction failed"}
          </p>
        )}
      </div>

      <div className="border border-border rounded-[8px] p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Unstake EKY Tokens</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
            placeholder="Amount to unstake"
            min="0"
            step="0.01"
            className="flex-1 border border-border bg-surface rounded-[4px] px-3 py-2 text-sm font-mono focus:border-accent"
          />
          <button
            onClick={() => setUnstakeAmount(formatMax(stakedBalanceFormatted))}
            className="bg-surface-alt border border-border px-3 py-2 rounded-[4px] text-xs font-mono uppercase tracking-wider hover:bg-border transition-colors"
          >
            MAX
          </button>
        </div>
        <button
          onClick={handleUnstake}
          disabled={unstakeLoading || !unstakeAmount || Number(unstakeAmount) <= 0}
          className="w-full bg-accent text-white py-2.5 px-4 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
        >
          {isUnstakingPending || isUnstakeConfirming ? "Unstaking..." : "Unstake"}
        </button>
        {isUnstakeSuccess && <p className="mt-3 text-pale-green-text text-xs font-mono">Successfully unstaked.</p>}
        {unstakeError && (
          <p className="mt-3 text-pale-red-text text-xs font-mono">
            Error: {unstakeError.message || "Transaction failed"}
          </p>
        )}
      </div>

      <div className="border border-border rounded-[8px] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Claim Rewards</h3>
            <p className="text-muted text-xs font-mono mt-1">{Number(earnedRewardsFormatted).toFixed(6)} EKY available</p>
          </div>
          <button
            onClick={() => claimRewards()}
            disabled={claimLoading || Number(earnedRewardsFormatted) === 0}
            className="bg-accent text-white py-2 px-6 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors text-sm font-medium tracking-wide"
          >
            {isClaimingPending || isClaimConfirming ? "Claiming..." : "Claim Rewards"}
          </button>
        </div>
        {isClaimSuccess && <p className="mt-3 text-pale-green-text text-xs font-mono">Rewards claimed.</p>}
        {claimError && (
          <p className="mt-3 text-pale-red-text text-xs font-mono">
            Error: {claimError.message || "Transaction failed"}
          </p>
        )}
      </div>
    </div>
  );
}