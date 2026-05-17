import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import SetupWizard from "@/components/SetupWizard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  SpecterEvasionModule,
  NexusExploitModule,
  GhostC2Module,
  ShadowExfilModule,
  LootVaultModule,
} from "./ModuleComponents";
import { AetherReconModule } from "./AetherRecon";

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [engagements, setEngagements] = useState<any[]>([]);
  const [selectedEngagement, setSelectedEngagement] = useState<number | null>(
    null,
  );
  const [showNewEngagement, setShowNewEngagement] = useState(false);
  const [engagementName, setEngagementName] = useState("");
  const [engagementTarget, setEngagementTarget] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const { data: setupStatus, isLoading: loadingSetup } =
    trpc.system.getSetupStatus.useQuery();
  const { data: operatorSettings } = trpc.system.getOperatorSettings.useQuery(
    undefined,
    {
      enabled: activeModule === "settings",
      retry: false,
    },
  );
  const { data: engagementsList, isLoading } = trpc.engagements.list.useQuery();
  const createEngagementMutation = trpc.engagements.create.useMutation();

  useEffect(() => {
    if (setupStatus && !setupStatus.completed) {
      setShowSetup(true);
    }
  }, [setupStatus]);

  useEffect(() => {
    if (engagementsList) {
      setEngagements(engagementsList);
      if (!selectedEngagement && engagementsList.length > 0) {
        setSelectedEngagement(engagementsList[0].id);
      }
    }
  }, [engagementsList, selectedEngagement]);

  const handleCreateEngagement = async () => {
    if (!engagementName.trim()) return;
    try {
      await createEngagementMutation.mutateAsync({
        name: engagementName,
        target: engagementTarget,
      });
      setEngagementName("");
      setEngagementTarget("");
      setShowNewEngagement(false);
    } catch (error) {
      console.error("Failed to create engagement:", error);
    }
  };

  if (loadingSetup) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {showSetup && <SetupWizard onComplete={() => setShowSetup(false)} />}

      <DashboardShell
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      >
        {activeModule === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold terminal-lg neon-glow-cyan">
                  RED TEAM OPERATIONS
                </h1>
                <p className="text-muted-foreground mt-2 terminal-text">
                  Unified command and control interface
                </p>
              </div>
              <Button
                onClick={() => setShowNewEngagement(!showNewEngagement)}
                className="gap-2 bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                <Plus className="w-4 h-4" />
                New Engagement
              </Button>
            </div>

            {showNewEngagement && (
              <Card className="cyber-card-lg border-accent/50">
                <div className="space-y-4">
                  <h3 className="terminal-lg neon-glow-magenta font-bold">
                    CREATE NEW ENGAGEMENT
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground terminal-text">
                        ENGAGEMENT NAME
                      </label>
                      <Input
                        value={engagementName}
                        onChange={(e) => setEngagementName(e.target.value)}
                        placeholder="e.g., OPERATION_ALPHA"
                        className="mt-2 bg-input border-accent/30 text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground terminal-text">
                        TARGET SCOPE
                      </label>
                      <Input
                        value={engagementTarget}
                        onChange={(e) => setEngagementTarget(e.target.value)}
                        placeholder="e.g., acme-corp.local"
                        className="mt-2 bg-input border-accent/30 text-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateEngagement}
                      disabled={!engagementName.trim()}
                      className="bg-accent hover:bg-accent/80 text-accent-foreground"
                    >
                      Create
                    </Button>
                    <Button
                      onClick={() => setShowNewEngagement(false)}
                      variant="outline"
                      className="border-accent/30"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <h2 className="terminal-lg neon-glow-cyan font-bold">
                ACTIVE ENGAGEMENTS
              </h2>
              {isLoading ? (
                <div className="text-center text-muted-foreground">
                  Loading engagements...
                </div>
              ) : engagements.length === 0 ? (
                <Card className="cyber-card-lg border-accent/30 text-center">
                  <p className="text-muted-foreground py-12">
                    No engagements yet. Create one to get started.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {engagements.map((engagement) => (
                    <Card
                      key={engagement.id}
                      className={`cyber-card cursor-pointer transition-all ${
                        selectedEngagement === engagement.id
                          ? "border-accent ring-1 ring-accent"
                          : "border-accent/30 hover:border-accent/50"
                      }`}
                      onClick={() => setSelectedEngagement(engagement.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="terminal-lg neon-glow-cyan font-bold">
                            {engagement.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 terminal-text">
                            {engagement.target}
                          </p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="status-active text-xs">●</span>
                            <span className="text-xs text-muted-foreground">
                              {engagement.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl opacity-50">◆</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeModule === "aether" && selectedEngagement && (
          <AetherReconModule engagementId={selectedEngagement} />
        )}

        {activeModule === "specter" && selectedEngagement && (
          <SpecterEvasionModule engagementId={selectedEngagement} />
        )}

        {activeModule === "nexus" && selectedEngagement && (
          <NexusExploitModule engagementId={selectedEngagement} />
        )}

        {activeModule === "ghost" && selectedEngagement && (
          <GhostC2Module engagementId={selectedEngagement} />
        )}

        {activeModule === "shadow" && selectedEngagement && (
          <ShadowExfilModule engagementId={selectedEngagement} />
        )}

        {activeModule === "loot" && selectedEngagement && (
          <LootVaultModule engagementId={selectedEngagement} />
        )}

        {activeModule === "settings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="terminal-lg neon-glow-cyan font-bold">
                  SETTINGS
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Operator configuration, secure key status, and model
                  preferences
                </p>
              </div>
              <Button
                onClick={() => setShowSetup(true)}
                variant="outline"
                className="border-accent/30"
              >
                Update Configuration
              </Button>
            </div>
            <Card className="cyber-card-lg border-accent/50">
              <div className="space-y-5">
                <h3 className="terminal-lg neon-glow-magenta font-bold">
                  OPERATOR PROFILE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded border border-accent/20 bg-accent/5 p-4">
                    <p className="text-xs text-muted-foreground terminal-text">
                      SETUP
                    </p>
                    <p className="mt-2 font-mono text-sm text-lime-400">
                      {operatorSettings?.setupCompleted
                        ? "Completed"
                        : "Incomplete"}
                    </p>
                  </div>
                  <div className="rounded border border-accent/20 bg-accent/5 p-4">
                    <p className="text-xs text-muted-foreground terminal-text">
                      THEME
                    </p>
                    <p className="mt-2 font-mono text-sm text-cyan-400 uppercase">
                      {operatorSettings?.theme ?? "dark"}
                    </p>
                  </div>
                  <div className="rounded border border-accent/20 bg-accent/5 p-4">
                    <p className="text-xs text-muted-foreground terminal-text">
                      MODEL MODE
                    </p>
                    <p className="mt-2 font-mono text-sm text-cyan-400">
                      {operatorSettings?.modelConfig?.useLocal
                        ? "Local model"
                        : "Hosted provider"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground terminal-text mb-3">
                    API KEY STATUS
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(operatorSettings?.configuredKeys ?? {}).map(
                      ([key, configured]) => (
                        <div
                          key={key}
                          className="rounded border border-accent/20 bg-black/30 p-3"
                        >
                          <p className="text-[10px] text-muted-foreground uppercase font-mono">
                            {key}
                          </p>
                          <p
                            className={`mt-1 text-xs font-mono ${configured ? "text-lime-400" : "text-yellow-400"}`}
                          >
                            {configured ? "Configured" : "Missing"}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </DashboardShell>
    </>
  );
}
