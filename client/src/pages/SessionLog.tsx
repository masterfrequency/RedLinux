import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";

export function SessionLogViewer({ engagementId }: { engagementId: number }) {
  const [filterModule, setFilterModule] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string>("");

  const { data: logs = [], isLoading } =
    trpc.engagements.getSessionLogs.useQuery({ engagementId });

  const filteredLogs = logs.filter((log: any) => {
    if (filterModule && log.module !== filterModule) return false;
    if (filterAction && log.action !== filterAction) return false;
    return true;
  });

  const modules = Array.from(new Set(logs.map((l: any) => l.module)));
  const actions = Array.from(new Set(logs.map((l: any) => l.action)));

  const handleExport = () => {
    const csv = [
      ["Timestamp", "Module", "Action", "Status", "Details"],
      ...filteredLogs.map((log: any) => [
        new Date(log.createdAt).toISOString(),
        log.module,
        log.action,
        log.status,
        log.details,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session-log-${engagementId}-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="terminal-lg neon-glow-cyan font-bold">SESSION LOG</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Timestamped activity audit trail
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="gap-2 bg-accent hover:bg-accent/80 text-accent-foreground"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card className="cyber-card-lg border-accent/50 p-4 space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground terminal-text">
              MODULE
            </label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full mt-2 bg-input border border-accent/30 rounded px-3 py-2 text-foreground text-sm"
            >
              <option value="">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground terminal-text">
              ACTION
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full mt-2 bg-input border border-accent/30 rounded px-3 py-2 text-foreground text-sm"
            >
              <option value="">All Actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <Button variant="outline" className="border-accent/30">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <div className="space-y-2">
        {isLoading ? (
          <Card className="cyber-card-lg border-accent/30 text-center py-12">
            <p className="text-muted-foreground">Loading activity log...</p>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card className="cyber-card-lg border-accent/30 text-center py-12">
            <p className="text-muted-foreground">No activities recorded yet.</p>
          </Card>
        ) : (
          filteredLogs.map((log: any, idx: number) => (
            <Card key={idx} className="cyber-card border-accent/30 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="terminal-text font-mono text-sm">
                    [{log.module.toUpperCase()}] {log.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(log.createdAt).toLocaleString()} (
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                    )
                  </p>
                  {log.details && (
                    <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                      {log.details}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${log.status === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                >
                  {log.status}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
