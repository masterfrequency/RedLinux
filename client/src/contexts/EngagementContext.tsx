import React, { createContext, useContext, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface EngagementContextType {
  selectedEngagementId: number | null;
  setSelectedEngagementId: (id: number | null) => void;
  activeEngagement: any | null;
  isLoading: boolean;
}

const EngagementContext = createContext<EngagementContextType | undefined>(
  undefined,
);

export function EngagementProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedEngagementId, setSelectedEngagementId] = useState<
    number | null
  >(() => {
    const saved = localStorage.getItem("selected-engagement-id");
    return saved ? parseInt(saved, 10) : null;
  });

  const { data: engagements, isLoading } = trpc.engagements.list.useQuery();

  useEffect(() => {
    if (selectedEngagementId) {
      localStorage.setItem(
        "selected-engagement-id",
        selectedEngagementId.toString(),
      );
    } else {
      localStorage.removeItem("selected-engagement-id");
    }
  }, [selectedEngagementId]);

  // Default to first engagement if none selected
  useEffect(() => {
    if (!selectedEngagementId && engagements && engagements.length > 0) {
      setSelectedEngagementId(engagements[0].id);
    }
  }, [engagements, selectedEngagementId]);

  const activeEngagement =
    engagements?.find((e) => e.id === selectedEngagementId) || null;

  return (
    <EngagementContext.Provider
      value={{
        selectedEngagementId,
        setSelectedEngagementId,
        activeEngagement,
        isLoading,
      }}
    >
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const context = useContext(EngagementContext);
  if (context === undefined) {
    throw new Error("useEngagement must be used within an EngagementProvider");
  }
  return context;
}
