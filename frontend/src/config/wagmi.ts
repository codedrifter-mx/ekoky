import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { defineChain } from "viem";

export const hardhatLocal = defineChain({
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
});

export const config = getDefaultConfig({
  appName: "Ekoky",
  projectId: "ekoky-local-dev",
  chains: [hardhatLocal],
  transports: {
    [hardhatLocal.id]: http(),
  },
  ssr: true,
});
