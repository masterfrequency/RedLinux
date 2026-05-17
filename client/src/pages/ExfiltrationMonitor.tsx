import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useEngagement } from "@/contexts/EngagementContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Share2, Plus, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const DEFAULT_TRANSFER_SIZE = 0;

export default function ExfiltrationMonitor() {
  const { selectedEngagementId } = useEngagement();
  const utils = trpc.useUtils();
  const [showCreate, setShowCreate] = useState(false);
  const [transferName, setTransferName] = useState("");
  const [dataType, setDataType] = useState<
    "telemetry" | "evidence_package" | "log_archive" | "report_bundle" | "other"
  >("telemetry");
  const [totalSizeMb, setTotalSizeMb] = useState("0");

  const { data: transfers, isLoading } = trpc.exfil.getTransfers.useQuery(
    { engagementId: selectedEngagementId || 0 },
    { enabled: !!selectedEngagementId },
  );

  const startTransfer = trpc.exfil.startTransfer.useMutation({
    onSuccess: () => {
      toast.success("Exfiltration transfer initiated");
      setTransferName("");
      setTotalSizeMb("0");
      setShowCreate(false);
      utils.exfil.getTransfers.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleNewTransfer = () => {
    if (!selectedEngagementId || !transferName.trim()) return;
    const parsedSize = Number(totalSizeMb);
    const totalSize =
      Number.isFinite(parsedSize) && parsedSize > 0
        ? Math.round(parsedSize * 1024 * 1024)
        : DEFAULT_TRANSFER_SIZE;

    startTransfer.mutate({
      engagementId: selectedEngagementId,
      name: transferName,
      dataType,
      totalSize,
    });
  };

  return (
    <DashboardLayout title="Exfiltration Monitor" subtitle="Shadow Exfil v4.1">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold terminal-text neon-glow-red">
              SHADOW EXFIL TRANSFERS
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              Monitor and track data exfiltration operations in real-time
            </p>
          </div>
          <Button
            className="gap-2 bg-red-600 hover:bg-red-700"
            onClick={() => setShowCreate(!showCreate)}
          >
            <Plus className="w-4 h-4" />
            Start Transfer
          </Button>
        </div>

        {showCreate && (
          <Card className="cyber-card border-red-500/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-sm font-mono">
                New Exfiltration Transfer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={transferName}
                onChange={(event) => setTransferName(event.target.value)}
                placeholder="Evidence package name"
                className="font-mono"
              />
              <Select
                value={dataType}
                onValueChange={(v: any) => setDataType(v)}
              >
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telemetry">Telemetry</SelectItem>
                  <SelectItem value="evidence_package">
                    Evidence Package
                  </SelectItem>
                  <SelectItem value="log_archive">Log Archive</SelectItem>
                  <SelectItem value="report_bundle">Report Bundle</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={totalSizeMb}
                onChange={(event) => setTotalSizeMb(event.target.value)}
                placeholder="Size MB (optional)"
                className="font-mono"
              />
              <Button
                onClick={handleNewTransfer}
                disabled={startTransfer.isPending || !transferName.trim()}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {startTransfer.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                INITIATE TRANSFER
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="cyber-card border-red-500/20">
          <CardHeader>
            <CardTitle className="text-sm font-mono flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              ACTIVE TRANSFERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              </div>
            ) : !transfers || transfers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                [ NO ACTIVE TRANSFERS ]
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                      Transfer Name
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                      Data Type
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                      Progress
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground font-mono text-xs uppercase">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow
                      key={transfer.id}
                      className="border-white/5 hover:bg-white/5"
                    >
                      <TableCell className="font-mono text-xs text-red-400">
                        {transfer.transferName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {transfer.dataType}
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress
                            value={transfer.progress}
                            className="h-1.5"
                          />
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {transfer.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${
                            transfer.status === "completed"
                              ? "bg-lime-500/20 text-lime-400"
                              : transfer.status === "in_progress"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {transfer.status}
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
