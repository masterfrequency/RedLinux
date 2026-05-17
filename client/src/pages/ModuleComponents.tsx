import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function SpecterEvasionModule({
  engagementId,
}: {
  engagementId: number;
}) {
  const utils = trpc.useUtils();
  const { data: signatures, isLoading } = trpc.specter.list.useQuery({
    engagementId,
  });
  const createSignature = trpc.specter.create.useMutation({
    onSuccess: () => {
      toast.success("New evasion payload created");
      utils.specter.list.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="terminal-lg neon-glow-magenta font-bold">
            SPECTER EVASION
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            EDR Bypass & Polymorphic Signatures
          </p>
        </div>
        <Button
          className="gap-2 bg-accent hover:bg-accent/80 text-accent-foreground"
          onClick={() =>
            createSignature.mutate({
              engagementId,
              payloadName: `payload_${Date.now()}`,
            })
          }
          disabled={createSignature.isPending}
        >
          {createSignature.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Payload
        </Button>
      </div>

      <Card className="cyber-card-lg border-accent/50">
        <div className="space-y-4">
          <h3 className="terminal-lg neon-glow-magenta font-bold">
            EVASION ENGINE
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="cyber-card border-accent/30">
              <p className="text-xs text-muted-foreground">PAYLOADS</p>
              <p className="terminal-lg neon-glow-cyan font-bold mt-2">
                {signatures?.length || 0}
              </p>
            </div>
            <div className="cyber-card border-accent/30">
              <p className="text-xs text-muted-foreground">BYPASSED</p>
              <p className="terminal-lg neon-glow-lime font-bold mt-2">
                {signatures?.filter((s) => s.edrBypassStatus === "bypassed")
                  .length || 0}
              </p>
            </div>
            <div className="cyber-card border-accent/30">
              <p className="text-xs text-muted-foreground">DETECTED</p>
              <p className="terminal-lg neon-glow-red font-bold mt-2">
                {signatures?.filter((s) => s.edrBypassStatus === "detected")
                  .length || 0}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !signatures || signatures.length === 0 ? (
        <Card className="cyber-card-lg border-accent/30 text-center py-12">
          <p className="text-muted-foreground">
            No evasion payloads yet. Create a new polymorphic payload to begin.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {signatures.map((sig) => (
            <Card key={sig.id} className="cyber-card border-accent/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="terminal-text font-mono text-sm">
                    {sig.payloadName}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase">
                    STATUS:{" "}
                    <span
                      className={
                        sig.edrBypassStatus === "bypassed"
                          ? "text-lime-400"
                          : "text-accent"
                      }
                    >
                      {sig.edrBypassStatus}
                    </span>
                  </p>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {new Date(sig.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function NexusExploitModule({ engagementId }: { engagementId: number }) {
  const { data: findings, isLoading } = trpc.nexus.getFindings.useQuery({
    engagementId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="terminal-lg neon-glow-lime font-bold">
            NEXUS EXPLOIT
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Vulnerability Exploitation & Synthesis
          </p>
        </div>
      </div>

      <Card className="cyber-card-lg border-accent/50">
        <div className="space-y-4">
          <h3 className="terminal-lg neon-glow-lime font-bold">
            VULNERABILITY SUMMARY
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {["critical", "high", "medium", "low"].map((severity) => (
              <div key={severity} className="cyber-card border-accent/30">
                <p className="text-xs text-muted-foreground uppercase">
                  {severity}
                </p>
                <p
                  className={`terminal-lg font-bold mt-2 ${severity === "critical" ? "neon-glow-red" : "neon-glow-lime"}`}
                >
                  {findings?.filter((f) => f.severity === severity).length || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !findings || findings.length === 0 ? (
        <Card className="cyber-card-lg border-accent/30 text-center py-12">
          <p className="text-muted-foreground">
            No vulnerabilities discovered. Log or synthesize an exploit to
            begin.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {findings.map((finding) => (
            <Card key={finding.id} className="cyber-card border-accent/30">
              <div className="flex justify-between items-center">
                <p className="terminal-text font-mono text-sm">
                  {finding.vulnerabilityName}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded border border-accent/30 uppercase">
                  {finding.severity}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function GhostC2Module({ engagementId }: { engagementId: number }) {
  const { data: channels, isLoading } = trpc.ghost.getChannels.useQuery({
    engagementId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="terminal-lg neon-glow-cyan font-bold">GHOST C2</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Command & Control Channels
          </p>
        </div>
      </div>

      <Card className="cyber-card-lg border-accent/50">
        <div className="space-y-4">
          <h3 className="terminal-lg neon-glow-cyan font-bold">
            CHANNEL MONITOR
          </h3>
          <div className="space-y-2">
            {channels?.slice(0, 3).map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-3 bg-input rounded border border-accent/30"
              >
                <span className="terminal-text text-sm">
                  {channel.channelName} ({channel.channelType})
                </span>
                <span
                  className={`text-[10px] font-bold ${channel.status === "active" ? "text-lime-400" : "text-red-500"}`}
                >
                  ● {channel.status.toUpperCase()}
                </span>
              </div>
            ))}
            {(!channels || channels.length === 0) && (
              <div className="flex items-center justify-between p-3 bg-input rounded border border-accent/30 opacity-50">
                <span className="terminal-text text-sm">
                  No active channels
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">
                  ● OFFLINE
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !channels || channels.length === 0 ? (
        <Card className="cyber-card-lg border-accent/30 text-center py-12">
          <p className="text-muted-foreground">
            No C2 channels established. Create a new channel to begin
            operations.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {channels.map((channel) => (
            <Card key={channel.id} className="cyber-card border-accent/30">
              <p className="terminal-text font-mono text-sm">
                {channel.channelName}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ShadowExfilModule({ engagementId }: { engagementId: number }) {
  const { data: transfers, isLoading } = trpc.exfil.getTransfers.useQuery({
    engagementId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="terminal-lg neon-glow-red font-bold">SHADOW EXFIL</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Data Exfiltration Tracking
          </p>
        </div>
      </div>

      <Card className="cyber-card-lg border-accent/50">
        <div className="space-y-4">
          <h3 className="terminal-lg neon-glow-red font-bold">
            TRANSFER ANALYTICS
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="cyber-card border-accent/30">
              <p className="text-xs text-muted-foreground">TOTAL</p>
              <p className="terminal-lg neon-glow-cyan font-bold mt-2">
                {transfers?.reduce((acc, t) => acc + (t.totalSize || 0), 0) ||
                  0}{" "}
                B
              </p>
            </div>
            <div className="cyber-card border-accent/30">
              <p className="text-xs text-muted-foreground">ACTIVE</p>
              <p className="terminal-lg font-bold mt-2">
                {transfers?.filter((t) => t.status === "in_progress").length ||
                  0}
              </p>
            </div>
            <div className="cyber-card border-accent/30">
              <p className="text-xs text-muted-foreground">DONE</p>
              <p className="terminal-lg neon-glow-lime font-bold mt-2">
                {transfers?.filter((t) => t.status === "completed").length || 0}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !transfers || transfers.length === 0 ? (
        <Card className="cyber-card-lg border-accent/30 text-center py-12">
          <p className="text-muted-foreground">
            No exfiltration transfers initiated. Create a new transfer to begin.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {transfers.map((transfer) => (
            <Card key={transfer.id} className="cyber-card border-accent/30">
              <div className="flex justify-between items-center">
                <p className="terminal-text font-mono text-sm">
                  {transfer.transferName}
                </p>
                <span className="text-[10px] font-mono">
                  {transfer.progress}%
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function LootVaultModule({ engagementId }: { engagementId: number }) {
  const { data: items, isLoading } = trpc.loot.getItems.useQuery({
    engagementId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="terminal-lg neon-glow-magenta font-bold">
            LOOT VAULT
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Captured Assets & Credentials
          </p>
        </div>
      </div>

      <Card className="cyber-card-lg border-accent/50">
        <div className="space-y-4">
          <h3 className="terminal-lg neon-glow-magenta font-bold">INVENTORY</h3>
          <div className="grid grid-cols-4 gap-4">
            {["hash", "credential", "document", "key"].map((type) => (
              <div key={type} className="cyber-card border-accent/30">
                <p className="text-xs text-muted-foreground uppercase">
                  {type}
                </p>
                <p className="terminal-lg font-bold mt-2">
                  {items?.filter((i) => i.itemType === type).length || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : !items || items.length === 0 ? (
        <Card className="cyber-card-lg border-accent/30 text-center py-12">
          <p className="text-muted-foreground">
            Vault is empty. Store captured credentials and loot here.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <Card
              key={item.id}
              className="cyber-card border-accent/30 flex items-center justify-between"
            >
              <p className="terminal-text font-mono text-sm">{item.name}</p>
              <span className="text-[10px] text-muted-foreground uppercase">
                {item.itemType}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
