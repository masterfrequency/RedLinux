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
import { Radio, Loader2, ShieldCheck } from "lucide-react";
import { useEngagement } from "@/contexts/EngagementContext";

export default function GhostC2() {
  const { selectedEngagementId } = useEngagement();
  const { data: agents, isLoading } = trpc.ghost.getAgents.useQuery(
    { engagementId: selectedEngagementId || 0 },
    { enabled: !!selectedEngagementId },
  );

  const handleAction = (type: string) => {
    toast.info(`[GHOST C2] Initializing ${type} sequence...`);
  };

  const hotspots = [
    {
      id: "agents-list",
      top: "8%",
      left: "1%",
      width: "23%",
      height: "85%",
      label: "ACTIVE AGENTS",
      action: () => handleAction("Agent Management"),
    },
    {
      id: "global-map",
      top: "8%",
      left: "25%",
      width: "53%",
      height: "55%",
      label: "OPERATIONS MAP",
      action: () => handleAction("Global Pivot"),
    },
    {
      id: "telemetry",
      top: "8%",
      left: "79%",
      width: "20%",
      height: "85%",
      label: "TELEMETRY OVERVIEW",
      action: () => handleAction("Telemetry Analysis"),
    },
    {
      id: "activity-log",
      top: "65%",
      left: "25%",
      width: "30%",
      height: "28%",
      label: "RECENT ACTIVITY",
      action: () => handleAction("Log Review"),
    },
    {
      id: "system-status",
      top: "65%",
      left: "56%",
      width: "22%",
      height: "28%",
      label: "SYSTEM STATUS",
      action: () => handleAction("Health Check"),
    },
  ];

  return (
    <DashboardLayout title="Ghost C2" subtitle="Neural Command v4.1">
      <div className="space-y-8">
        <InteractiveInterface
          imageSrc="/ghost_c2_overlay.png"
          hotspots={hotspots}
          title="GHOST C2 COMMAND OVERLAY"
        />

        <Card className="border-cyan-500/20 bg-black/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono text-sm flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Active Agent Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : !agents || agents.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground font-mono uppercase">
                No active agents connected
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead className="text-muted-foreground font-mono">
                      Agent ID
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono">
                      Hostname
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono">
                      OS
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id} className="border-white/5">
                      <TableCell className="font-mono text-cyan-400">
                        {agent.agentId}
                      </TableCell>
                      <TableCell className="font-mono text-white">
                        {agent.hostname}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {agent.os}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-lime-400">
                          <ShieldCheck className="h-3 w-3" />
                          ONLINE
                        </span>
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
