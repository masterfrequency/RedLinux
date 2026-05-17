import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import InteractiveInterface from "@/components/InteractiveInterface";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Radio, Shield, Terminal, Trash2 } from "lucide-react";
import { useEngagement } from "@/contexts/EngagementContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function GhostC2() {
  const { selectedEngagementId } = useEngagement();
  const utils = trpc.useUtils();

  const { data: channels, isLoading } = trpc.ghost.getChannels.useQuery(
    { engagementId: selectedEngagementId || 0 },
    { enabled: !!selectedEngagementId },
  );

  const createChannel = trpc.ghost.createChannel.useMutation({
    onSuccess: () => {
      toast.success("C2 channel established");
      utils.ghost.getChannels.invalidate();
    },
    onError: (err) => toast.error(`Deployment failed: ${err.message}`),
  });

  const killChannel = trpc.ghost.killChannel.useMutation({
    onSuccess: () => {
      toast.success("Channel terminated");
      utils.ghost.getChannels.invalidate();
    },
  });

  const handleAction = (label: string) => {
    if (!selectedEngagementId) {
      toast.error("No active engagement selected");
      return;
    }

    const typeMap: Record<string, "https" | "dns" | "icmp" | "steganographic"> =
      {
        "Stealth Channel": "https",
        "DNS Tunnel": "dns",
        "ICMP Beacon": "icmp",
        "Neural Link": "steganographic",
      };

    const channelType = typeMap[label] || "https";

    toast.info(`Establishing ${label}...`);
    createChannel.mutate({
      engagementId: selectedEngagementId,
      channelName: `ghost_${channelType}_${Math.floor(Math.random() * 10000)}`,
      channelType,
    });
  };

  const hotspots = [
    {
      id: "c2-1",
      top: "15%",
      left: "5%",
      width: "25%",
      height: "30%",
      label: "Stealth Channel",
      action: () => handleAction("Stealth Channel"),
    },
    {
      id: "c2-2",
      top: "15%",
      left: "35%",
      width: "30%",
      height: "30%",
      label: "DNS Tunnel",
      action: () => handleAction("DNS Tunnel"),
    },
    {
      id: "c2-3",
      top: "50%",
      left: "5%",
      width: "25%",
      height: "30%",
      label: "ICMP Beacon",
      action: () => handleAction("ICMP Beacon"),
    },
    {
      id: "c2-4",
      top: "50%",
      left: "35%",
      width: "30%",
      height: "30%",
      label: "Neural Link",
      action: () => handleAction("Neural Link"),
    },
    {
      id: "terminal",
      top: "15%",
      left: "70%",
      width: "25%",
      height: "65%",
      label: "C2 Terminal",
      action: () => toast.info("Terminal access restricted to active sessions"),
    },
  ];

  return (
    <DashboardLayout title="Ghost C2" subtitle="Stealth Command & Control v4.1">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InteractiveInterface
              imageSrc="/interface_c2.png"
              hotspots={hotspots}
              title="GHOST C2 NEURAL OVERLAY"
            />
          </div>

          <div className="space-y-6">
            <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-cyan-400">
                  <Radio className="h-4 w-4" /> ACTIVE CHANNELS
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  </div>
                ) : !channels || channels.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground font-mono">
                    [ NO ACTIVE BEACONS ]
                  </div>
                ) : (
                  <div className="space-y-3">
                    {channels.map((channel) => (
                      <div
                        key={channel.id}
                        className="p-3 border border-white/5 bg-white/5 rounded-lg flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${channel.status === "active" ? "bg-lime-400 animate-pulse" : "bg-red-500"}`}
                            />
                            <span className="text-xs font-mono text-cyan-100">
                              {channel.channelName}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[9px] border-cyan-500/30 text-cyan-400 uppercase"
                          >
                            {channel.channelType}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                          onClick={() =>
                            killChannel.mutate({
                              channelId: channel.id,
                              engagementId: selectedEngagementId!,
                            })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-black/40 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-cyan-400">
                  <Shield className="h-4 w-4" /> SECURITY STATUS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-muted-foreground">ENCRYPTION:</span>
                  <span className="text-lime-400">AES-256-GCM</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-muted-foreground">
                    TRAFFIC MASKING:
                  </span>
                  <span className="text-lime-400">ENABLED</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-muted-foreground">ANTI-ANALYSIS:</span>
                  <span className="text-lime-400">ACTIVE</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-cyan-500/20 bg-black/40">
          <CardHeader>
            <CardTitle className="text-sm font-mono flex items-center gap-2 text-cyan-400">
              <Terminal className="h-4 w-4" /> CHANNEL LOGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                    Timestamp
                  </TableHead>
                  <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                    Channel
                  </TableHead>
                  <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                    Event
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground font-mono text-xs uppercase">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels?.slice(0, 5).map((channel) => (
                  <TableRow
                    key={`log-${channel.id}`}
                    className="border-white/5 hover:bg-white/5"
                  >
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {new Date(channel.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-cyan-400">
                      {channel.channelName}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white">
                      Initial handshake established
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="text-[9px] border-lime-500/30 text-lime-400 uppercase"
                      >
                        SUCCESS
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!channels || channels.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground font-mono text-xs"
                    >
                      [ NO LOG DATA AVAILABLE ]
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
