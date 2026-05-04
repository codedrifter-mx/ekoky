import Link from "next/link";
import { StakeForm } from "@/components/StakeForm";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">Ekoky</h1>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
          An eco-friendly marketplace connecting businesses with food surplus
          to institutions that can collect and redistribute it.
        </p>
        <div className="flex space-x-4">
          <Link
            href="/business"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            I&apos;m a Business
          </Link>
          <Link
            href="/institution"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
          >
            I&apos;m an Institution
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-4">Stake EKY Tokens</h2>
        <p className="text-gray-600 mb-4">
          Stake your EKY tokens to earn rewards. The longer you stake, the more you earn.
        </p>
        <StakeForm />
      </div>
    </div>
  );
}
