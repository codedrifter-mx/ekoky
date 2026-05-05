"use client";

export interface InterestItem {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string | null;
  createdAt: string;
  institution: { id: string; name: string; address: string };
}

interface InterestListProps {
  interests: InterestItem[];
  isOwner: boolean;
  onUpdateStatus: (
    interestId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => void;
  updatingId?: string | null;
}

const statusColors: Record<InterestItem["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

export function InterestList({
  interests,
  isOwner,
  onUpdateStatus,
  updatingId,
}: InterestListProps) {
  if (interests.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Interests</h3>
      <div className="space-y-3">
        {interests.map((interest) => (
          <div
            key={interest.id}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-gray-800">
                  {interest.institution.name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(interest.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded ${statusColors[interest.status]}`}
              >
                {interest.status}
              </span>
            </div>
            {interest.message && (
              <p className="text-sm text-gray-600 mb-3">{interest.message}</p>
            )}
            {isOwner && interest.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateStatus(interest.id, "ACCEPTED")}
                  disabled={updatingId === interest.id}
                  className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => onUpdateStatus(interest.id, "REJECTED")}
                  disabled={updatingId === interest.id}
                  className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
