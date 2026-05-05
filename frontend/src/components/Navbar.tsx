"use client";

import { useAuth } from "@/hooks/useAuth";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass = "text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition";
const activeClass = "text-green-600 bg-green-50 px-3 py-2 rounded-md text-sm font-medium transition";

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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold text-green-600 mr-4">
              Ekoky
            </Link>
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

          <div className="flex items-center space-x-4">
            {role && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {role === "BUSINESS" ? "Business" : "Institution"}
              </span>
            )}
            {authenticated && (
              <button
                onClick={signOut}
                className="text-sm text-gray-600 hover:text-red-600 transition"
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
