import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Security() {
  const [confirm, setConfirm] = useState("");
  const panic = trpc.panic.executeEmergencyPurge.useMutation({
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.error(err.message),
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-red flex items-center gap-3">
            <ShieldAlert className="h-8 w-8" />
            Security & Panic
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Emergency protocols and operational security management.
          </p>
        </div>

        <Card className="cyber-card border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-500 text-sm flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Emergency Purge (Self-Destruct)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Executing an emergency purge will securely shred all assets in the
              shadow vault and clear operational logs. This action is
              irreversible.
            </p>
            <div className="flex gap-4">
              <Input
                placeholder="Type 'CONFIRM_PURGE' to execute"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="font-mono border-red-900/30"
              />
              <Button
                variant="destructive"
                onClick={() =>
                  panic.mutate({ engagementId: 1, confirmation: confirm })
                }
                disabled={confirm !== "CONFIRM_PURGE" || panic.isPending}
              >
                {panic.isPending ? "Purging..." : "EXECUTE PURGE"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
