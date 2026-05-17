import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import InteractiveInterface from "@/components/InteractiveInterface";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEngagement } from "@/contexts/EngagementContext";
import { Loader2 } from "lucide-react";

export default function NetworkInfiltrator() {
  const { selectedEngagementId, activeEngagement } = useEngagement();

  const {
    data: scans,
    isLoading,
    refetch,
  } = trpc.network.getScans.useQuery(
    { engagementId: selectedEngagementId || 0 },
    { enabled: !!selectedEngagementId },
  );

  const startScan = trpc.network.startScan.useMutation({
    onSuccess: () => {
      toast.success("Infiltration scan initiated via Neural Overlay");
      refetch();
    },
    onError: (err) => toast.error(`Infiltration failed: ${err.message}`),
  });

  const handleAction = (type: string) => {
    if (!selectedEngagementId || !activeEngagement?.target) {
      toast.error("No active engagement or target defined");
      return;
    }
    toast.info(`Triggering ${type}...`);
    startScan.mutate({
      engagementId: selectedEngagementId,
      target: activeEngagement.target,
    });
  };

  const hotspots = [
    {
      id: "status",
      top: "10%",
      left: "2%",
      width: "20%",
      height: "25%",
      label: "Infiltration Status",
      action: () => handleAction("Status Check"),
    },
    {
      id: "topology",
      top: "10%",
      left: "25%",
      width: "50%",
      height: "60%",
      label: "Network Topology",
      action: () => handleAction("Topology Scan"),
    },
    {
      id: "packet",
      top: "10%",
      left: "78%",
      width: "20%",
      height: "25%",
      label: "Packet Flow",
      action: () => handleAction("Packet Sniffing"),
    },
    {
      id: "assessment",
      top: "40%",
      left: "78%",
      width: "20%",
      height: "25%",
      label: "Vulnerability Assessment",
      action: () => handleAction("Vulnerability Scan"),
    },
    {
      id: "logs",
      top: "72%",
      left: "25%",
      width: "35%",
      height: "25%",
      label: "Real-time Logs",
      action: () => handleAction("Log Retrieval"),
    },
  ];

  return (
    <DashboardLayout
      title="Network Infiltrator"
      subtitle="Neural Interface v4.1"
    >
      <div className="space-y-8">
        <InteractiveInterface
          imageSrc="/interface_network.png"
          hotspots={hotspots}
          title="NETWORK INFILTRATION OVERLAY"
        />

        <Card className="border-white/10 bg-black/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-primary font-mono text-sm">
              Active & Past Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !scans || scans.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground font-mono uppercase">
                No scan data available
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead className="text-muted-foreground font-mono">
                      Target
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono">
                      Results
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scans.map((scan) => (
                    <TableRow key={scan.id} className="border-white/5">
                      <TableCell className="font-mono text-primary">
                        {scan.target}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${scan.status === "completed" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}`}
                        >
                          {scan.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {scan.results
                          ? (() => {
                              try {
                                return (
                                  JSON.parse(scan.results).length +
                                  " nodes found"
                                );
                              } catch (e) {
                                return "N/A";
                              }
                            })()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {new Date(scan.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
