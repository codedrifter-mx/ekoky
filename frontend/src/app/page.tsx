import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-5xl font-extrabold text-green-700 mb-6 tracking-tight">
          Reduce Food Waste. Feed Communities.
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          An eco-friendly marketplace connecting businesses with food surplus
          to institutions that can collect and redistribute it.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ConnectButton />
          <Link
            href="/explore"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg font-medium"
          >
            Browse Offers
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow border text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Business Lists
            </h3>
            <p className="text-gray-600">
              A business registers and lists surplus food available for
              collection.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow border text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Institution Expresses Interest
            </h3>
            <p className="text-gray-600">
              Institutions browse offers and express interest in collecting
              surplus food.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow border text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Food Gets Redistributed
            </h3>
            <p className="text-gray-600">
              Food is collected and redistributed to communities in need,
              reducing waste.
            </p>
          </div>
        </div>
      </section>

      {/* Why Blockchain */}
      <section className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-12">
          Why Blockchain?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Verifiable Impact
            </h3>
            <p className="text-gray-600 text-sm">
              Every transaction is recorded on-chain, creating transparent and
              auditable impact metrics.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Trust & Reputation
            </h3>
            <p className="text-gray-600 text-sm">
              On-chain reputation builds trust between businesses and
              institutions over time.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl mb-3">🪙</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Token Economics
            </h3>
            <p className="text-gray-600 text-sm">
              EKY tokens incentivize participation and reward sustainable
              behavior through staking.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Free to Browse
            </h3>
            <p className="text-gray-600 text-sm">
              Anyone can explore offers and impact data without needing to
              connect a wallet.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-50 rounded-2xl py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-4">
          Ready to reduce food waste?
        </h2>
        <p className="text-gray-700 mb-8 max-w-xl mx-auto">
          Join the movement and start making a difference today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg font-medium"
          >
            Get Started
          </Link>
          <Link
            href="/impact"
            className="bg-white text-green-700 border border-green-200 px-8 py-3 rounded-lg hover:bg-green-100 transition text-lg font-medium"
          >
            View Impact
          </Link>
        </div>
      </section>
    </div>
  );
}
