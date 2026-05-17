import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Download, Terminal } from "lucide-react";

export default function AIStrategist() {
  const [targetInfo, setTargetInfo] = useState("");
  const [strategy, setStrategy] = useState("");

  const { data: models } = trpc.ai.getModels.useQuery();
  const generate = trpc.ai.generateStrategy.useMutation({
    onSuccess: (data) => setStrategy(data.strategy),
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-cyan flex items-center gap-3">
            <BrainCircuit className="h-8 w-8" />
            AI Strategist (Aether-Alpha)
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Unrestricted adversarial intelligence for operation planning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="terminal-text text-sm flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Local Models
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {models?.map((model) => (
                    <div
                      key={model}
                      className="p-2 border border-accent/20 rounded bg-accent/5 font-mono text-xs"
                    >
                      {model}
                    </div>
                  ))}
                  {models?.length === 0 && (
                    <div className="text-muted-foreground text-xs italic">
                      No models downloaded.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="terminal-text text-sm">
                  Target Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Textarea
                  placeholder="Enter target infrastructure details, security posture, or OSINT findings..."
                  value={targetInfo}
                  onChange={(e) => setTargetInfo(e.target.value)}
                  className="font-mono min-h-[150px]"
                />
                <Button
                  onClick={() =>
                    generate.mutate({ engagementId: 1, targetInfo })
                  }
                  disabled={!targetInfo || generate.isPending}
                  className="w-full"
                >
                  {generate.isPending ? "Analyzing..." : "Generate Strategy"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="cyber-card h-full">
              <CardHeader>
                <CardTitle className="terminal-text text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Strategy Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black/50 p-6 rounded-lg border border-accent/20 min-h-[400px] font-mono text-sm text-lime-400 whitespace-pre-wrap">
                  {strategy || "[ WAITING FOR INPUT ]"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
