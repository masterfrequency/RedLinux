import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, ShieldCheck } from "lucide-react";
import { useEngagement } from "@/contexts/EngagementContext";

export default function PayloadGenerator() {
  const [name, setName] = useState("");
  const [os, setOs] = useState<"windows" | "linux" | "macos">("windows");
  const [arch, setArch] = useState<"x64" | "x86" | "arm64">("x64");
  const [format, setFormat] = useState<
    "exe" | "elf" | "macho" | "dll" | "so" | "reflective_dll" | "shellcode"
  >("exe");
  const { selectedEngagementId } = useEngagement();

  const generate = trpc.payload.generate.useMutation();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-cyan flex items-center gap-3">
            <FileCode className="h-8 w-8" />
            Training Artifact Generator
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Generate benign defensive exercise manifests for authorized lab
            validation.
          </p>
        </div>

        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="terminal-text text-sm">
              Generator Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Artifact Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-mono"
              />
              <Select value={os} onValueChange={(v: any) => setOs(v)}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Target OS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="windows">Windows</SelectItem>
                  <SelectItem value="linux">Linux</SelectItem>
                  <SelectItem value="macos">macOS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={arch} onValueChange={(v: any) => setArch(v)}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Architecture" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x64">x64</SelectItem>
                  <SelectItem value="x86">x86</SelectItem>
                  <SelectItem value="arm64">ARM64</SelectItem>
                </SelectContent>
              </Select>
              <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exe">EXE</SelectItem>
                  <SelectItem value="elf">ELF</SelectItem>
                  <SelectItem value="macho">Mach-O</SelectItem>
                  <SelectItem value="dll">DLL</SelectItem>
                  <SelectItem value="so">SO</SelectItem>
                  <SelectItem value="reflective_dll">
                    Reflective DLL Manifest
                  </SelectItem>
                  <SelectItem value="shellcode">Shellcode Manifest</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() =>
                  selectedEngagementId &&
                  generate.mutate({
                    engagementId: selectedEngagementId,
                    name,
                    os,
                    arch,
                    format,
                  })
                }
                disabled={!name || !selectedEngagementId || generate.isPending}
              >
                {generate.isPending
                  ? "Generating..."
                  : "Generate Defensive Manifest"}
              </Button>
            </div>

            {generate.data && (
              <div className="flex flex-col gap-4 p-4 border border-accent/20 rounded bg-accent/5 overflow-hidden">
                <h3 className="terminal-text text-xs">Generation Result</h3>
                <div className="font-mono text-xs text-lime-400">
                  <p>File: {generate.data.payloadName}</p>
                  <p>Status: Safe manifest ready</p>
                  <div className="mt-2 p-2 bg-black/40 rounded border border-accent/10">
                    <p className="text-muted-foreground mb-1 uppercase text-[10px]">
                      Manifest Preview:
                    </p>
                    <pre className="whitespace-pre-wrap break-all text-[10px] text-cyan-400/80">
                      {generate.data.payloadContent.substring(0, 300)}...
                    </pre>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto"
                  disabled
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Binary export
                  disabled by design
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
