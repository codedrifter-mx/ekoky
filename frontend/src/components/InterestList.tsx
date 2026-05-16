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

const statusStyles: Record<InterestItem["status"], string> = {
  PENDING: "bg-pale-yellow-bg text-pale-yellow-text",
  ACCEPTED: "bg-pale-green-bg text-pale-green-text",
  REJECTED: "bg-pale-red-bg text-pale-red-text",
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
      <h3 className="text-sm font-semibold uppercase tracking-wider">Interests</h3>
      <div className="space-y-2">
        {interests.map((interest) => (
          <div
            key={interest.id}
            className="bg-surface border border-border p-4 rounded-[4px]"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium text-sm">
                  {interest.institution.name}
                </p>
                <p className="text-[10px] font-mono text-muted tracking-wider">
                  {new Date(interest.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-[10px] font-mono uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-[4px] ${statusStyles[interest.status]}`}>
                {interest.status}
              </span>
            </div>
            {interest.message && (
              <p className="text-sm text-muted mb-3 leading-relaxed">{interest.message}</p>
            )}
            {isOwner && interest.status === "PENDING" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onUpdateStatus(interest.id, "ACCEPTED")}
                  disabled={updatingId === interest.id}
                  className="bg-accent text-white text-xs px-3 py-1.5 rounded-[4px] hover:bg-[#333333] disabled:bg-muted/30 transition-colors font-medium tracking-wide"
                >
                  Accept
                </button>
                <button
                  onClick={() => onUpdateStatus(interest.id, "REJECTED")}
                  disabled={updatingId === interest.id}
                  className="border border-border text-foreground text-xs px-3 py-1.5 rounded-[4px] hover:bg-surface-alt disabled:bg-muted/30 transition-colors font-medium tracking-wide"
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