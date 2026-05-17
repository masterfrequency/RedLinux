import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useEngagement } from "@/contexts/EngagementContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function SocialArchitect() {
  const { selectedEngagementId } = useEngagement();
  const [targetAudience, setTargetAudience] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<
    "urgent" | "casual" | "authority" | "friendly"
  >("urgent");
  const generatePhishing = trpc.social.generatePhishingTemplate.useMutation({
    onSuccess: () => toast.success("Phishing template generated successfully"),
    onError: (error) => toast.error(`Generation failed: ${error.message}`),
  });

  const handleGenerate = () => {
    if (!selectedEngagementId) {
      toast.error("Select an engagement before generating phishing template.");
      return;
    }
    generatePhishing.mutate({
      engagementId: selectedEngagementId,
      targetAudience,
      context,
      tone,
    });
  };

  return (
    <DashboardLayout title="Social Architect" subtitle="Phishing Campaign v4.1">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-cyan flex items-center gap-3">
            <Users className="h-8 w-8" />
            Social Architect
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Generate targeted phishing campaigns and social engineering pretexts
            for credential harvesting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="terminal-text text-sm">
                Phishing Campaign Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                placeholder="Target audience or persona"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
              <Select
                value={tone}
                onValueChange={(v: typeof tone) => setTone(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="authority">Authority</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Campaign context: business scenario, pretext, target role, or engagement details"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                onClick={handleGenerate}
                disabled={
                  generatePhishing.isPending ||
                  !targetAudience.trim() ||
                  !context.trim()
                }
              >
                {generatePhishing.isPending
                  ? "Generating..."
                  : "GENERATE PHISHING TEMPLATE"}
              </Button>
            </CardContent>
          </Card>

          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="terminal-text text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" /> Phishing Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/50 p-4 rounded border border-accent/20 font-mono text-sm min-h-[200px] whitespace-pre-wrap text-lime-400">
                {generatePhishing.data?.template ||
                  "[ Phishing template output pending... ]"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
