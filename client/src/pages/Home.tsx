import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  LockKeyhole,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [operatorKey, setOperatorKey] = useState("");
  const utils = trpc.useUtils();
  const loginStatus = trpc.auth.loginStatus.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Operator session established");
      await utils.auth.me.invalidate();
      window.location.href = "/dashboard";
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ operatorKey });
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,209,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,0,128,0.12),transparent_30%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <Card className="relative w-full max-w-xl border-primary/30 bg-black/70 backdrop-blur-xl shadow-[0_0_60px_rgba(0,255,209,0.15)]">
        <CardHeader className="space-y-5 border-b border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="border-primary/40 text-primary font-mono"
            >
              REDLINUX v4.1
            </Badge>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight terminal-lg neon-glow-cyan">
              Operator Access
            </CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground font-mono leading-relaxed">
              Authenticate with the server-side operator key to start a signed,
              HTTP-only session. The previous example landing page has been
              replaced with a hardened access gate suitable for deployment.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {loginStatus.data && !loginStatus.data.configured && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200 flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Operator key is not configured.</p>
                <p className="text-yellow-200/80 mt-1">
                  Set <code className="font-mono">REDLINUX_OPERATOR_KEY</code>{" "}
                  to a high-entropy value of at least 16 characters before
                  logging in.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="operator-key"
                className="font-mono text-xs uppercase text-muted-foreground"
              >
                Operator Key
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="operator-key"
                  type="password"
                  autoComplete="current-password"
                  value={operatorKey}
                  onChange={(event) => setOperatorKey(event.target.value)}
                  className="pl-10 bg-black/50 border-primary/20 font-mono"
                  placeholder="Enter configured operator key"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending || operatorKey.length === 0}
              className="w-full bg-primary hover:bg-primary/80 text-black font-bold font-mono"
            >
              {loginMutation.isPending
                ? "Establishing Session..."
                : "Unlock Command Console"}
            </Button>
          </form>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground font-mono space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Terminal className="h-4 w-4" />
              <span className="uppercase tracking-widest">
                Deployment Notes
              </span>
            </div>
            <p>
              Sessions are signed with <code>JWT_SECRET</code>, scoped to
              HTTP-only cookies, and expire automatically.
            </p>
            <p>
              Use a reverse proxy with HTTPS in production so secure cookies and
              rate limits protect the operator console.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
