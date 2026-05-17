import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InteractiveInterface from "@/components/InteractiveInterface";
import { toast } from "sonner";
import { useEngagement } from "@/contexts/EngagementContext";
import { useLocation } from "wouter";

/**
 * PhonkAlphabet's Supreme Dashboard
 * Fully interactive weaponized UI.
 */

export default function SupremeDashboard() {
  const { selectedEngagementId } = useEngagement();
  const [, setLocation] = useLocation();

  const handleAction = (module: string, action: string) => {
    if (!selectedEngagementId) {
      toast.error("No active engagement selected");
      return;
    }
    toast.info(`[${module}] Initializing ${action} sequence...`);
    
    // Navigate to specific module pages based on interaction
    switch(module) {
      case "GHOST C2": setLocation("/ghost"); break;
      case "NEXUS EXPLOIT": setLocation("/nexus"); break;
      case "AETHER RECON": setLocation("/osint"); break;
      case "SHADOW EXFIL": setLocation("/exfil"); break;
      case "NEURAL CORE": setLocation("/advanced"); break;
    }
  };

  const hotspots = [
    {
      id: "ghost-c2",
      top: "8%",
      left: "1%",
      width: "22%",
      height: "48%",
      label: "GHOST C2 ENGINE",
      action: () => handleAction("GHOST C2", "Agent Synchronization"),
    },
    {
      id: "neural-core",
      top: "8%",
      left: "24%",
      width: "41%",
      height: "48%",
      label: "NEURAL CORE",
      action: () => handleAction("NEURAL CORE", "Neural Link"),
    },
    {
      id: "nexus-exploit",
      top: "8%",
      left: "66%",
      width: "33%",
      height: "48%",
      label: "NEXUS EXPLOIT",
      action: () => handleAction("NEXUS EXPLOIT", "Weaponization"),
    },
    {
      id: "aether-recon",
      top: "58%",
      left: "1%",
      width: "57%",
      height: "38%",
      label: "AETHER RECON",
      action: () => handleAction("AETHER RECON", "Global OSINT Synthesis"),
    },
    {
      id: "shadow-exfil",
      top: "58%",
      left: "59%",
      width: "40%",
      height: "38%",
      label: "SHADOW EXFIL",
      action: () => handleAction("SHADOW EXFIL", "Covert Data Stream"),
    },
    {
      id: "fire-button",
      top: "43%",
      left: "90%",
      width: "8%",
      height: "5%",
      label: "EXECUTE",
      action: () => toast.error("CRITICAL: EXPLOIT EXECUTION TRIGGERED"),
    }
  ];

  return (
    <DashboardLayout title="Supreme Command" subtitle="Neural Interface v4.1">
      <div className="w-full h-full min-h-[800px]">
        <InteractiveInterface
          imageSrc="/supreme_ui_overlay.png"
          hotspots={hotspots}
          title="REDLINUX SUPREME OVERLAY"
        />
      </div>
    </DashboardLayout>
  );
}
