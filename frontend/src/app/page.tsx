import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="space-y-32">
      <section className="py-24 px-4 text-center" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(237,243,236,0.6) 0%, transparent 70%)" }}>
        <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted mb-6">Blockchain-verified surplus redistribution</p>
        <h1 className="font-serif text-6xl md:text-7xl font-normal mb-8" style={{ letterSpacing: "-0.03em", lineHeight: "1.05" }}>
          Reduce food waste.<br />Feed communities.
        </h1>
        <p className="text-lg text-muted max-w-xl mx-auto leading-relaxed mb-12">
          An eco-friendly marketplace connecting businesses with food surplus to institutions that can collect and redistribute it.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ConnectButton />
          <Link
            href="/explore"
            className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
          >
            Browse Offers
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted mb-4">How it works</p>
        <h2 className="font-serif text-4xl mb-16">Three steps to impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          <div className="bg-surface p-10">
            <div className="w-10 h-10 rounded-[4px] bg-pale-green-bg flex items-center justify-center mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pale-green-text"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Business Lists</h3>
            <p className="text-muted text-sm leading-relaxed">
              A business registers and lists surplus food available for collection.
            </p>
          </div>
          <div className="bg-surface p-10">
            <div className="w-10 h-10 rounded-[4px] bg-pale-blue-bg flex items-center justify-center mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pale-blue-text"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Institution Expresses Interest</h3>
            <p className="text-muted text-sm leading-relaxed">
              Institutions browse offers and express interest in collecting surplus food.
            </p>
          </div>
          <div className="bg-surface p-10">
            <div className="w-10 h-10 rounded-[4px] bg-pale-teal-bg flex items-center justify-center mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pale-teal-text"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Food Gets Redistributed</h3>
            <p className="text-muted text-sm leading-relaxed">
              Food is collected and redistributed to communities in need, reducing waste.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4">
        <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted mb-4">Why blockchain</p>
        <h2 className="font-serif text-4xl mb-16">Transparent by design</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          <div className="bg-surface p-10">
            <div className="w-10 h-10 rounded-[4px] bg-pale-green-bg flex items-center justify-center mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pale-green-text"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.11"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Verifiable Impact</h3>
            <p className="text-muted text-sm leading-relaxed">
              Every transaction is recorded on-chain, creating transparent and auditable impact metrics.
            </p>
          </div>
          <div className="bg-surface p-10">
            <div className="w-10 h-10 rounded-[4px] bg-pale-blue-bg flex items-center justify-center mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pale-blue-text"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Trust &amp; Reputation</h3>
            <p className="text-muted text-sm leading-relaxed">
              On-chain reputation builds trust between businesses and institutions over time.
            </p>
          </div>
          <div className="bg-surface p-10">
            <div className="w-10 h-10 rounded-[4px] bg-pale-yellow-bg flex items-center justify-center mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pale-yellow-text"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Token Economics</h3>
            <p className="text-muted text-sm leading-relaxed">
              EKY tokens incentivize participation and reward sustainable behavior through staking.
            </p>
          </div>
          <div className="bg-surface p-10">
            <div className="w-10 h-10 rounded-[4px] bg-pale-teal-bg flex items-center justify-center mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pale-teal-text"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Free to Browse</h3>
            <p className="text-muted text-sm leading-relaxed">
              Anyone can explore offers and impact data without needing to connect a wallet.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface border border-border py-24 px-4 text-center rounded-[8px]" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(237,243,236,0.4) 0%, transparent 70%), #FFFFFF" }}>
        <h2 className="font-serif text-4xl mb-4">Ready to reduce food waste?</h2>
        <p className="text-muted mb-10 max-w-md mx-auto">
          Join the movement and start making a difference today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-accent text-white px-8 py-3 rounded-[4px] hover:bg-[#333333] transition-colors text-sm font-medium tracking-wide"
          >
            Get Started
          </Link>
          <Link
            href="/impact"
            className="border border-border text-foreground px-8 py-3 rounded-[4px] hover:bg-surface-alt transition-colors text-sm font-medium tracking-wide"
          >
            View Impact
          </Link>
        </div>
      </section>
    </div>
  );
}