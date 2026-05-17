import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InteractiveInterface from "@/components/InteractiveInterface";
import { toast } from "sonner";
import { useEngagement } from "@/contexts/EngagementContext";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PhonkAlphabet's Supreme Dashboard (Animated)
 * Fully interactive weaponized UI with motion effects.
 */

export default function SupremeDashboard() {
  const { selectedEngagementId } = useEngagement();
  const [, setLocation] = useLocation();
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsBooting(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (module: string, action: string) => {
    if (!selectedEngagementId) {
      toast.error("No active engagement selected");
      return;
    }
    toast.info(`[${module}] Initializing ${action} sequence...`);
    
    switch(module) {
      case "GHOST C2": setLocation("/ghost"); break;
      case "NEXUS EXPLOIT": setLocation("/nexus"); break;
      case "AETHER RECON": setLocation("/osint"); break;
      case "SHADOW EXFIL": setLocation("/exfil"); break;
      case "NEURAL CORE": setLocation("/advanced"); break;
    }
  };

  const hotspots = [
    { id: "ghost-c2", top: "8%", left: "1%", width: "22%", height: "48%", label: "GHOST C2 ENGINE", action: () => handleAction("GHOST C2", "Agent Synchronization") },
    { id: "neural-core", top: "8%", left: "24%", width: "41%", height: "48%", label: "NEURAL CORE", action: () => handleAction("NEURAL CORE", "Neural Link") },
    { id: "nexus-exploit", top: "8%", left: "66%", width: "33%", height: "48%", label: "NEXUS EXPLOIT", action: () => handleAction("NEXUS EXPLOIT", "Weaponization") },
    { id: "aether-recon", top: "58%", left: "1%", width: "57%", height: "38%", label: "AETHER RECON", action: () => handleAction("AETHER RECON", "Global OSINT Synthesis") },
    { id: "shadow-exfil", top: "58%", left: "59%", width: "40%", height: "38%", label: "SHADOW EXFIL", action: () => handleAction("SHADOW EXFIL", "Covert Data Stream") },
    { id: "fire-button", top: "43%", left: "90%", width: "8%", height: "5%", label: "EXECUTE", action: () => toast.error("CRITICAL: EXPLOIT EXECUTION TRIGGERED") }
  ];

  return (
    <DashboardLayout title="Supreme Command" subtitle="Neural Interface v4.1">
      <AnimatePresence>
        {isBooting ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black font-mono text-cyan-400"
          >
            <div className="space-y-2 text-center">
              <motion.div 
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="text-2xl font-bold tracking-tighter"
              >
                INITIALIZING SUPREME CORE...
              </motion.div>
              <div className="text-[10px] text-muted-foreground uppercase">
                PhonkAlphabet Weaponized Framework v4.1
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full min-h-[800px] animate-scanline"
          >
            <InteractiveInterface
              imageSrc="/supreme_ui_overlay.png"
              hotspots={hotspots}
              title="REDLINUX SUPREME OVERLAY"
            />
            
            {/* Animated HUD Elements */}
            <div className="absolute top-4 right-4 flex gap-4 pointer-events-none">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase">System Integrity</span>
                <motion.span 
                  animate={{ color: ["#4ade80", "#22d3ee", "#4ade80"] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-xs font-bold"
                >
                  98.4% SECURE
                </motion.span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase">Neural Link</span>
                <span className="text-xs font-bold text-cyan-400 animate-pulse">ACTIVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
