import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  ShieldAlert,
  Share2,
  Image as ImageIcon,
  Loader2,
  Bug,
  Radio,
} from "lucide-react";
import { useEngagement } from "@/contexts/EngagementContext";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function UltraAdvanced() {
  const { selectedEngagementId } = useEngagement();
  const { data: mesh } = trpc.advanced.getMeshStatus.useQuery(
    { engagementId: selectedEngagementId || 0 },
    { enabled: !!selectedEngagementId },
  );

  const polymorph = trpc.advanced.polymorphPayload.useMutation({
    onSuccess: () => toast.success("Polymorphic mutation complete"),
  });

  const stegano = trpc.advanced.steganoExfil.useMutation({
    onSuccess: (data) =>
      toast.success(`Stegano exfil complete: ${data.outputPath}`),
  });

  const shadowC2 = trpc.advanced.deployShadowC2.useMutation({
    onSuccess: (data) => toast.success(`Shadow C2 deployed: ${data.shadowId}`),
  });

  const specterBypass = trpc.advanced.specterBypass.useMutation({
    onSuccess: (data) => toast.success(`Bypass technique: ${data.technique}`),
  });

  const rootkit = trpc.advanced.kernelRootkitIntegrator.useMutation({
    onSuccess: () => toast.success("Rootkit deployment sequence initiated"),
  });

  const [sourceCode, setSourceCode] = useState(
    "void main() { printf('hello'); }",
  );
  const [exfilData, setExfilData] = useState("");
  const [carrierImage, setCarrierImage] = useState("/interface_osint.png");
  const [targetHost, setTargetHost] = useState("192.168.1.100");

  return (
    <DashboardLayout
      title="Ultra-Advanced Operative"
      subtitle="Neural Core v4.1"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-magenta flex items-center gap-3">
            <Zap className="h-8 w-8" />
            ULTRA-ADVANCED
          </h1>
          <p className="text-muted-foreground terminal-sm font-mono">
            Neural-linked blackhat arsenal. Zero mockups. Pure execution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Polymorph Engine */}
          <Card className="cyber-card border-magenta-500/20 bg-black/40">
            <CardHeader>
              <CardTitle className="terminal-text text-sm flex items-center gap-2 text-magenta-400">
                <ShieldAlert className="h-4 w-4" />
                AETHER POLYMORPH ENGINE
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <textarea
                className="bg-black/50 p-4 rounded border border-accent/20 font-mono text-xs min-h-[150px] w-full resize-none focus:outline-none focus:border-magenta-500/50"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                placeholder="// Enter source code for mutation..."
              />
              <div className="bg-black/80 p-4 rounded border border-magenta-500/20 font-mono text-[10px] min-h-[100px] text-lime-400 overflow-auto max-h-[200px]">
                {polymorph.data?.mutatedCode ? (
                  <pre>{polymorph.data.mutatedCode}</pre>
                ) : (
                  <span className="text-muted-foreground italic">
                    // Waiting for mutation sequence...
                  </span>
                )}
              </div>
              <Button
                className="bg-magenta-600 hover:bg-magenta-700 text-white font-mono text-xs"
                onClick={() =>
                  polymorph.mutate({
                    source: sourceCode,
                    language: "c",
                    antiVM: true,
                  })
                }
                disabled={polymorph.isPending}
              >
                {polymorph.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "EXECUTE POLYMORPHIC MUTATION"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Ghost Mesh */}
          <Card className="cyber-card border-cyan-500/20 bg-black/40">
            <CardHeader>
              <CardTitle className="terminal-text text-sm flex items-center gap-2 text-cyan-400">
                <Share2 className="h-4 w-4" />
                GHOST MESH TOPOLOGY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs terminal-text mb-4 border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">MESH HEALTH:</span>
                  <span className="text-lime-400 font-bold">
                    {mesh?.meshHealth || "0%"}
                  </span>
                </div>
                <div className="space-y-2">
                  {mesh?.nodes.map((node: any) => (
                    <div
                      key={node.id}
                      className="flex justify-between p-3 border border-cyan-500/10 rounded bg-cyan-500/5 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${node.status === "active" ? "bg-lime-400 shadow-[0_0_5px_rgba(163,230,53,0.5)]" : "bg-red-500"}`}
                        />
                        <span className="text-cyan-100">{node.id}</span>
                      </div>
                      <span
                        className={
                          node.status === "active"
                            ? "text-lime-400"
                            : "text-red-500"
                        }
                      >
                        {node.status.toUpperCase()}{" "}
                        <span className="text-muted-foreground ml-1">
                          [{node.latency}]
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shadow C2 & Specter Bypass */}
          <Card className="cyber-card border-orange-500/20 bg-black/40">
            <CardHeader>
              <CardTitle className="terminal-text text-sm flex items-center gap-2 text-orange-400">
                <Radio className="h-4 w-4" />
                COVERT OPERATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  value={targetHost}
                  onChange={(e) => setTargetHost(e.target.value)}
                  className="font-mono text-xs bg-black/50 border-orange-500/20"
                  placeholder="Target Host IP"
                />
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white font-mono text-xs"
                  onClick={() =>
                    selectedEngagementId &&
                    shadowC2.mutate({
                      engagementId: selectedEngagementId,
                      targetHost,
                      transport: "https",
                    })
                  }
                  disabled={shadowC2.isPending || !selectedEngagementId}
                >
                  DEPLOY SHADOW C2
                </Button>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs"
                onClick={() =>
                  selectedEngagementId &&
                  specterBypass.mutate({
                    engagementId: selectedEngagementId,
                    payloadId: "payload-v4",
                  })
                }
                disabled={specterBypass.isPending || !selectedEngagementId}
              >
                EXECUTE SPECTER BYPASS
              </Button>
              {specterBypass.data && (
                <div className="p-2 border border-purple-500/20 bg-purple-500/5 rounded text-[10px] font-mono text-purple-400">
                  BYPASS TECHNIQUE: {specterBypass.data.technique}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rootkit */}
          <Card className="cyber-card border-red-500/20 bg-black/40">
            <CardHeader>
              <CardTitle className="terminal-text text-sm flex items-center gap-2 text-red-400">
                <Bug className="h-4 w-4" />
                KERNEL EVASION
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="border-red-500/20 hover:bg-red-500/10 text-red-400 font-mono text-[10px]"
                  onClick={() =>
                    selectedEngagementId &&
                    rootkit.mutate({
                      engagementId: selectedEngagementId,
                      targetOS: "linux",
                      rootkitType: "syscall_hook",
                    })
                  }
                  disabled={rootkit.isPending || !selectedEngagementId}
                >
                  DEPLOY LINUX ROOTKIT
                </Button>
              </div>
              {rootkit.data?.payload && (
                <div className="p-2 border border-red-500/20 bg-red-500/5 rounded text-[10px] font-mono text-red-400">
                  PAYLOAD: {rootkit.data.payload}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stegano Exfil */}
          <Card className="cyber-card lg:col-span-2 border-primary/20 bg-black/40">
            <CardHeader>
              <CardTitle className="terminal-text text-sm flex items-center gap-2 text-primary">
                <ImageIcon className="h-4 w-4" />
                STEGANO EXFIL SHADOW-STREAM
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-muted-foreground uppercase font-mono">
                    Carrier Image Path
                  </label>
                  <Input
                    value={carrierImage}
                    onChange={(e) => setCarrierImage(e.target.value)}
                    className="font-mono text-xs bg-black/50 border-primary/20"
                    placeholder="/path/to/carrier.png"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-muted-foreground uppercase font-mono">
                    Data to Embed
                  </label>
                  <textarea
                    className="bg-black/50 p-4 rounded border border-primary/20 font-mono text-xs min-h-[80px] w-full resize-none focus:outline-none focus:border-primary/50"
                    value={exfilData}
                    onChange={(e) => setExfilData(e.target.value)}
                    placeholder="Enter sensitive data..."
                  />
                </div>
              </div>
              <Button
                className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono text-xs"
                onClick={() =>
                  selectedEngagementId &&
                  stegano.mutate({
                    engagementId: selectedEngagementId,
                    imagePath: carrierImage,
                    data: exfilData,
                  })
                }
                disabled={
                  !exfilData || !selectedEngagementId || stegano.isPending
                }
              >
                {stegano.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "EXECUTE STEGANO EXFILTRATION"
                )}
              </Button>
              {stegano.data?.outputPath && (
                <div className="mt-2 p-3 border border-lime-500/20 bg-lime-500/5 rounded text-[10px] font-mono text-lime-400 break-all flex flex-col gap-2">
                  <span>OUTPUT: {stegano.data.outputPath}</span>
                  <a
                    href={`/artifacts/${stegano.data.outputPath.split("/").pop()}`}
                    download
                    className="text-primary hover:underline"
                  >
                    DOWNLOAD STEGANO ARTIFACT
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
