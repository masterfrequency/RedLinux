import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Shield,
  Cpu,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SetupWizardProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: "welcome",
    title: "Neural Initialization",
    description: "Welcome to RedLinux v4.1",
  },
  {
    id: "api_keys",
    title: "Intelligence Access",
    description: "Configure external intelligence providers",
  },
  {
    id: "llm_config",
    title: "Neural Core",
    description: "Configure AI models and GGUF integration",
  },
  {
    id: "final",
    title: "System Ready",
    description: "Finalizing installation",
  },
];

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [keys, setKeys] = useState({
    shodan: "",
    censys_id: "",
    censys_secret: "",
    greynoise: "",
    openai: "",
  });
  const [modelConfig, setModelConfig] = useState({
    useLocal: true,
    modelPath: "models/llama-3-8b-instruct.Q4_K_M.gguf",
  });

  const saveSettings = trpc.system.saveInitialSetup.useMutation({
    onSuccess: () => {
      toast.success("System configuration synchronized");
      setCurrentStep((prev) => prev + 1);
    },
    onError: (err) => toast.error(`Sync failed: ${err.message}`),
  });

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      onComplete();
    } else if (currentStep === 2) {
      saveSettings.mutate({ keys, modelConfig });
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "welcome":
        return (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="relative">
                <Shield className="h-20 w-20 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground font-mono leading-relaxed">
                Operator identity confirmed. Before we begin tactical
                operations, we must establish neural links with external
                intelligence providers and initialize the local AI core.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge
                  variant="outline"
                  className="border-primary/50 text-primary font-mono text-[10px]"
                >
                  OSINT SYNC
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/50 text-primary font-mono text-[10px]"
                >
                  C2 MAPPING
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/50 text-primary font-mono text-[10px]"
                >
                  AI STRATEGIST
                </Badge>
              </div>
            </div>
          </div>
        );

      case "api_keys":
        return (
          <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              <div className="p-3 border border-primary/20 bg-primary/5 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-mono text-primary flex items-center gap-2">
                    <Key className="h-3 w-3" /> SHODAN API KEY
                  </Label>
                  <a
                    href="https://account.shodan.io/"
                    target="_blank"
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Get Key <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
                <Input
                  placeholder="Enter Shodan API Key..."
                  value={keys.shodan}
                  onChange={(e) => setKeys({ ...keys, shodan: e.target.value })}
                  className="bg-black/40 border-white/10 h-8 text-xs font-mono"
                />
                <p className="text-[9px] text-muted-foreground italic">
                  Required for global device reconnaissance and vulnerability
                  mapping.
                </p>
              </div>

              <div className="p-3 border border-primary/20 bg-primary/5 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-mono text-primary flex items-center gap-2">
                    <Key className="h-3 w-3" /> CENSYS CREDENTIALS
                  </Label>
                  <a
                    href="https://search.censys.io/account/api"
                    target="_blank"
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Get Credentials <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="API ID"
                    value={keys.censys_id}
                    onChange={(e) =>
                      setKeys({ ...keys, censys_id: e.target.value })
                    }
                    className="bg-black/40 border-white/10 h-8 text-xs font-mono"
                  />
                  <Input
                    placeholder="Secret"
                    type="password"
                    value={keys.censys_secret}
                    onChange={(e) =>
                      setKeys({ ...keys, censys_secret: e.target.value })
                    }
                    className="bg-black/40 border-white/10 h-8 text-xs font-mono"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground italic">
                  Enables advanced certificate analysis and attack surface
                  discovery.
                </p>
              </div>

              <div className="p-3 border border-primary/20 bg-primary/5 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-mono text-primary flex items-center gap-2">
                    <Key className="h-3 w-3" /> GREYNOISE API KEY
                  </Label>
                  <a
                    href="https://viz.greynoise.io/settings/api"
                    target="_blank"
                    className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    Get Key <ExternalLink className="h-2 w-2" />
                  </a>
                </div>
                <Input
                  placeholder="Enter GreyNoise API Key..."
                  value={keys.greynoise}
                  onChange={(e) =>
                    setKeys({ ...keys, greynoise: e.target.value })
                  }
                  className="bg-black/40 border-white/10 h-8 text-xs font-mono"
                />
                <p className="text-[9px] text-muted-foreground italic">
                  Used to filter out internet background noise and identify real
                  threats.
                </p>
              </div>
            </div>
          </div>
        );

      case "llm_config":
        return (
          <div className="space-y-6 py-4">
            <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-mono font-bold text-primary">
                    LOCAL GGUF CORE
                  </h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Autonomous Intelligence
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-black/40 rounded border border-white/5">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-xs font-mono">
                      Llama-3-8B-Instruct (Q4_K_M)
                    </span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/50 text-[9px]">
                    RECOMMENDED
                  </Badge>
                </div>

                <div className="text-[10px] text-muted-foreground font-mono space-y-1">
                  <p>• Seamless integration with llama.cpp</p>
                  <p>• Optimized for memory-resident execution</p>
                  <p>• Zero external data leakage</p>
                </div>

                <div className="pt-2">
                  <Label className="text-[10px] font-mono text-muted-foreground mb-2 block uppercase">
                    Model Storage Path
                  </Label>
                  <Input
                    value={modelConfig.modelPath}
                    onChange={(e) =>
                      setModelConfig({
                        ...modelConfig,
                        modelPath: e.target.value,
                      })
                    }
                    className="bg-black/40 border-white/10 h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "final":
        return (
          <div className="space-y-6 py-8 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-mono font-bold text-primary">
                NEURAL LINK ESTABLISHED
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                RedLinux v4.1 is now fully synchronized with your tactical
                environment.
              </p>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-[10px] font-mono text-left space-y-1">
              <p className="text-primary font-bold uppercase mb-2">
                Final Checks:
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" /> API
                Endpoints Validated
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" /> Database
                Schema Migrated
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" /> AI Core
                Initialized
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
      <Card className="w-full max-w-lg border-primary/30 bg-black/60 shadow-[0_0_50px_rgba(var(--primary),0.2)] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),1)]"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <CardHeader className="border-b border-white/5 bg-white/5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-mono font-bold text-primary uppercase tracking-tighter flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {STEPS[currentStep].title}
              </CardTitle>
              <CardDescription className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                {STEPS[currentStep].description}
              </CardDescription>
            </div>
            <div className="text-[10px] font-mono text-primary/40 bg-primary/5 px-2 py-1 rounded border border-primary/10">
              STEP 0{currentStep + 1} / 0{STEPS.length}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">{renderStep()}</CardContent>

        <CardFooter className="border-t border-white/5 bg-white/5 p-4 flex justify-between items-center">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-4 rounded-full transition-all duration-300 ${i === currentStep ? "bg-primary w-8" : "bg-white/10"}`}
              />
            ))}
          </div>
          <Button
            onClick={handleNext}
            disabled={saveSettings.isPending}
            className="bg-primary hover:bg-primary/80 text-black font-bold font-mono px-6 h-9"
          >
            {saveSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {currentStep === STEPS.length - 1
                  ? "LAUNCH DASHBOARD"
                  : "PROCEED"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
