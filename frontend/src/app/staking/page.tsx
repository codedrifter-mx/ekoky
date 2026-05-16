"use client";

import { useAccount } from "wagmi";
import { useTokenBalance } from "@/hooks/useEkokyToken";
import { useStakingInfo } from "@/hooks/useStaking";
import { StakeForm } from "@/components/StakeForm";

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const { formatted: balanceFormatted } = useTokenBalance(address);
  const {
    stakedBalanceFormatted,
    earnedRewardsFormatted,
    totalStakedFormatted,
  } = useStakingInfo(address);

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-4xl">Staking</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-[8px] overflow-hidden">
        <div className="bg-surface p-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-1">Wallet Balance</p>
          <p className="text-2xl font-semibold">
            {isConnected ? `${Number(balanceFormatted).toFixed(4)} ` : "-- "}
            <span className="text-xs text-muted font-mono">EKY</span>
          </p>
        </div>
        <div className="bg-surface p-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-1">Staked Balance</p>
          <p className="text-2xl font-semibold">
            {isConnected ? `${Number(stakedBalanceFormatted).toFixed(4)} ` : "-- "}
            <span className="text-xs text-muted font-mono">EKY</span>
          </p>
        </div>
        <div className="bg-surface p-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.1em] text-muted mb-1">Earned Rewards</p>
          <p className="text-2xl font-semibold">
            {isConnected ? `${Number(earnedRewardsFormatted).toFixed(6)} ` : "-- "}
            <span className="text-xs text-muted font-mono">EKY</span>
          </p>
        </div>
      </div>

      <div className="bg-surface-alt border border-border rounded-[8px] p-4">
        <p className="text-sm text-muted">
          Total Staked in Protocol: {" "}
          <span className="font-semibold text-foreground font-mono">
            {Number(totalStakedFormatted).toFixed(2)} EKY
          </span>
        </p>
      </div>

      <StakeForm />
    </div>
  );
}