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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-green-600">Staking</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow border">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="text-2xl font-bold text-green-600">
            {isConnected ? `${Number(balanceFormatted).toFixed(4)} EKY` : "--"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <p className="text-sm text-gray-500">Staked Balance</p>
          <p className="text-2xl font-bold text-blue-600">
            {isConnected ? `${Number(stakedBalanceFormatted).toFixed(4)} EKY` : "--"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <p className="text-sm text-gray-500">Earned Rewards</p>
          <p className="text-2xl font-bold text-amber-600">
            {isConnected ? `${Number(earnedRewardsFormatted).toFixed(6)} EKY` : "--"}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Total Staked in Protocol: {" "}
          <span className="font-semibold text-gray-800">
            {Number(totalStakedFormatted).toFixed(2)} EKY
          </span>
        </p>
      </div>

      <StakeForm />
    </div>
  );
}
