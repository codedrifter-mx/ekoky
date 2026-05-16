"use client";

import { useAuth } from "@/hooks/useAuth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass = "text-muted hover:text-foreground px-3 py-2 text-sm transition-colors";
const activeClass = "text-foreground border-b border-accent px-3 py-2 text-sm font-medium";

export function Navbar() {
  const { authenticated, role, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const getNavLinks = () => {
    if (role === "BUSINESS") {
      return [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/offers/new", label: "Create Offer" },
        { href: "/explore", label: "Explore" },
        { href: "/staking", label: "Staking" },
      ];
    }
    if (role === "INSTITUTION") {
      return [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/explore", label: "Explore" },
        { href: "/staking", label: "Staking" },
      ];
    }
    return [{ href: "/explore", label: "Explore" }];
  };

  const links = getNavLinks();

  return (
    <nav className="border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="font-serif text-lg tracking-tight text-accent" style={{ letterSpacing: "-0.02em" }}>
              Ekoky
            </Link>
            <div className="hidden sm:flex items-center space-x-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={isActive(link.href) ? activeClass : linkClass}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/impact"
                className={isActive("/impact") ? activeClass : linkClass}
              >
                Impact
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {role && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-[0.1em] font-medium bg-pale-green-bg text-pale-green-text">
                {role === "BUSINESS" ? "Business" : "Institution"}
              </span>
            )}
            {authenticated && (
              <button
                onClick={signOut}
                className="text-xs text-muted hover:text-pale-red-text transition-colors font-mono uppercase tracking-wider"
              >
                Sign Out
              </button>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}