import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useEngagement } from "@/contexts/EngagementContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ghost, Terminal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function SpecterEvasion() {
  const { selectedEngagementId } = useEngagement();
  const [sourceCode, setSourceCode] = useState("");
  const [language, setLanguage] = useState<
    "c" | "python" | "go" | "powershell"
  >("c");
  const obfuscate = trpc.specter.obfuscatePayload.useMutation({
    onSuccess: () =>
      toast.success("Payload obfuscation complete - EDR evasion ready"),
    onError: (error) => toast.error(`Obfuscation failed: ${error.message}`),
  });

  const handleObfuscate = () => {
    if (!selectedEngagementId) {
      toast.error("Select an engagement before obfuscating payload.");
      return;
    }
    obfuscate.mutate({
      engagementId: selectedEngagementId,
      sourceCode,
      language,
      enableAntiVM: true,
    });
  };

  return (
    <DashboardLayout title="Specter Evasion" subtitle="Polymorphic Engine v4.1">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-cyan flex items-center gap-3">
            <Ghost className="h-8 w-8" />
            Specter Evasion
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Polymorphic obfuscation and EDR bypass techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="terminal-text text-sm">
                Polymorphic Obfuscation Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Select
                value={language}
                onValueChange={(v: typeof language) => setLanguage(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="powershell">PowerShell</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Paste source code for EDR evasion transformation..."
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="font-mono min-h-[300px]"
              />
              <Button
                onClick={handleObfuscate}
                disabled={obfuscate.isPending || !sourceCode.trim()}
              >
                {obfuscate.isPending
                  ? "Generating..."
                  : "GENERATE OBFUSCATED PAYLOAD"}
              </Button>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="terminal-text text-sm flex items-center gap-2">
                <Terminal className="h-4 w-4" /> Obfuscation Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 p-4 rounded border border-accent/20 font-mono text-sm min-h-[300px] whitespace-pre-wrap text-lime-400">
                {obfuscate.data?.obfuscatedCode ||
                  "[ Obfuscation output pending... ]"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
