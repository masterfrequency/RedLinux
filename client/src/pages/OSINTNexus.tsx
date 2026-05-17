import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import InteractiveInterface from "@/components/InteractiveInterface";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Database } from "lucide-react";
import { useEngagement } from "@/contexts/EngagementContext";

export default function OSINTNexus() {
  const { selectedEngagementId, activeEngagement } = useEngagement();
  const utils = trpc.useUtils();

  const { data: findings, isLoading: loadingFindings } =
    trpc.osint.getFindings.useQuery(
      { engagementId: selectedEngagementId || 0 },
      { enabled: !!selectedEngagementId },
    );

  const startScan = trpc.osint.startNexusScan.useMutation({
    onSuccess: () => {
      toast.success("Aether-OSINT Nexus scan initiated via Neural Overlay");
      utils.osint.getFindings.invalidate();
    },
    onError: (err) => {
      toast.error(`Scan failed: ${err.message}`);
    },
  });

  const handleScan = (type: string) => {
    if (!selectedEngagementId || !activeEngagement?.target) {
      toast.error("No active engagement or target defined");
      return;
    }
    toast.info(`Executing ${type} sub-routine...`);
    startScan.mutate({
      engagementId: selectedEngagementId,
      target: activeEngagement.target,
    });
  };

  const hotspots = [
    {
      id: "target",
      top: "10%",
      left: "2%",
      width: "20%",
      height: "25%",
      label: "Target Acquisition",
      action: () => handleScan("Target Acquisition"),
    },
    {
      id: "mapping",
      top: "10%",
      left: "25%",
      width: "35%",
      height: "50%",
      label: "Network Mapping",
      action: () => handleScan("Network Mapping"),
    },
    {
      id: "feed",
      top: "10%",
      left: "75%",
      width: "23%",
      height: "25%",
      label: "Intelligence Feed",
      action: () => handleScan("Intelligence Feed"),
    },
    {
      id: "extraction",
      top: "40%",
      left: "75%",
      width: "23%",
      height: "30%",
      label: "Entity Extraction",
      action: () => handleScan("Entity Extraction"),
    },
    {
      id: "terminal",
      top: "75%",
      left: "75%",
      width: "23%",
      height: "20%",
      label: "Neural Terminal",
      action: () => handleScan("Terminal Input"),
    },
    {
      id: "risk",
      top: "75%",
      left: "62%",
      width: "12%",
      height: "20%",
      label: "Risk Analysis",
      action: () => handleScan("Risk Assessment"),
    },
  ];

  return (
    <DashboardLayout
      title="Aether-OSINT Nexus"
      subtitle="Neural Interface v4.1"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InteractiveInterface
              imageSrc="/interface_osint.png"
              hotspots={hotspots}
              title="AETHER-OSINT NEXUS OVERLAY"
            />
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-black/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
                  <Database className="h-4 w-4" /> LIVE FINDINGS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {loadingFindings ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : !findings || findings.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground font-mono">
                    NO DATA ACQUIRED
                  </div>
                ) : (
                  findings.map((finding) => {
                    let data = {};
                    try {
                      data = JSON.parse(finding.data);
                    } catch (e) {}
                    return (
                      <div
                        key={finding.id}
                        className="p-3 border border-white/5 bg-white/5 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <Badge
                            variant="outline"
                            className="text-[10px] border-primary/30 text-primary uppercase"
                          >
                            {finding.provider}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(finding.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs font-mono break-all">
                          {finding.target}
                        </p>
                        <div className="text-[10px] text-muted-foreground font-mono truncate">
                          TYPE: {finding.findingType}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-black/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
                  <Globe className="h-4 w-4" /> TARGET CONTEXT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs font-mono space-y-1">
                  <p className="text-muted-foreground uppercase">
                    Active Engagement:
                  </p>
                  <p className="text-primary font-bold">
                    {activeEngagement?.name || "NONE"}
                  </p>
                </div>
                <div className="text-xs font-mono space-y-1">
                  <p className="text-muted-foreground uppercase">
                    Current Target:
                  </p>
                  <p className="text-primary font-bold">
                    {activeEngagement?.target || "UNDEFINED"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
