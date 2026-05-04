"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-green-600">
              Ekoky
            </Link>
            <Link href="/business" className="text-gray-700 hover:text-green-600">
              Business
            </Link>
            <Link href="/institution" className="text-gray-700 hover:text-green-600">
              Institution
            </Link>
          </div>
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
