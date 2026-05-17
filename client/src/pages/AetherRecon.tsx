import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AetherFinding {
  id: number;
  targetType: string;
  targetValue: string;
  findingType: string;
  confidence: number;
  source?: string;
}

export function AetherReconModule({ engagementId }: { engagementId: number }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    targetType: "email",
    targetValue: "",
    findingType: "credential",
    source: "",
    confidence: 75,
  });

  const {
    data: findings = [],
    isLoading,
    refetch,
  } = trpc.aether.list.useQuery({ engagementId });
  const createMutation = trpc.aether.create.useMutation();

  const handleAddFinding = async () => {
    if (!formData.targetValue.trim()) {
      toast.error("Target value is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        engagementId,
        targetType: formData.targetType as any,
        targetValue: formData.targetValue,
        findingType: formData.findingType as any,
        source: formData.source,
        confidence: formData.confidence,
      });

      setFormData({
        targetType: "email",
        targetValue: "",
        findingType: "credential",
        source: "",
        confidence: 75,
      });
      setShowForm(false);
      await refetch();
      toast.success("Finding stored successfully");
    } catch (error) {
      toast.error("Failed to store finding");
    }
  };

  const filteredFindings = findings.filter(
    (f: any) =>
      f.targetValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.source?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="terminal-lg neon-glow-cyan font-bold">AETHER RECON</h2>
          <p className="text-xs text-muted-foreground mt-1">
            OSINT Intelligence Gathering
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-accent hover:bg-accent/80 text-accent-foreground"
        >
          <Plus className="w-4 h-4" />
          Add Finding
        </Button>
      </div>

      {showForm && (
        <Card className="cyber-card-lg border-accent/50">
          <div className="space-y-4">
            <h3 className="terminal-lg neon-glow-magenta font-bold">
              NEW FINDING
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground terminal-text">
                  TARGET TYPE
                </label>
                <select
                  value={formData.targetType}
                  onChange={(e) =>
                    setFormData({ ...formData, targetType: e.target.value })
                  }
                  className="w-full mt-2 bg-input border border-accent/30 rounded px-3 py-2 text-foreground text-sm"
                >
                  <option>email</option>
                  <option>person</option>
                  <option>domain</option>
                  <option>company</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground terminal-text">
                  FINDING TYPE
                </label>
                <select
                  value={formData.findingType}
                  onChange={(e) =>
                    setFormData({ ...formData, findingType: e.target.value })
                  }
                  className="w-full mt-2 bg-input border border-accent/30 rounded px-3 py-2 text-foreground text-sm"
                >
                  <option>credential</option>
                  <option>social_link</option>
                  <option>phone</option>
                  <option>address</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground terminal-text">
                TARGET VALUE
              </label>
              <Input
                value={formData.targetValue}
                onChange={(e) =>
                  setFormData({ ...formData, targetValue: e.target.value })
                }
                placeholder="e.g., john.doe@acme.com"
                className="mt-2 bg-input border-accent/30 text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground terminal-text">
                  SOURCE
                </label>
                <Input
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="e.g., LinkedIn"
                  className="mt-2 bg-input border-accent/30 text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground terminal-text">
                  CONFIDENCE ({formData.confidence}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.confidence}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confidence: parseInt(e.target.value),
                    })
                  }
                  className="w-full mt-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddFinding}
                disabled={createMutation.isPending}
                className="bg-accent hover:bg-accent/80 text-accent-foreground"
              >
                {createMutation.isPending ? "Storing..." : "Store Finding"}
              </Button>
              <Button
                onClick={() => setShowForm(false)}
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
        <div className="flex gap-2">
          <Input
            placeholder="Search findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-input border-accent/30 text-foreground"
          />
          <Button variant="outline" className="border-accent/30">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <Card className="cyber-card-lg border-accent/30 text-center py-12">
            <p className="text-muted-foreground">Loading findings...</p>
          </Card>
        ) : filteredFindings.length === 0 ? (
          <Card className="cyber-card-lg border-accent/30 text-center py-12">
            <p className="text-muted-foreground">
              No findings yet. Add intelligence to begin.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredFindings.map((finding: any) => (
              <Card
                key={finding.id}
                className="cyber-card border-accent/30 flex items-center justify-between p-4"
              >
                <div className="flex-1">
                  <p className="terminal-text font-mono text-sm">
                    {finding.targetValue}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {finding.targetType} • {finding.findingType} • Confidence:{" "}
                    {finding.confidence}%
                    {finding.source && ` • Source: ${finding.source}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
