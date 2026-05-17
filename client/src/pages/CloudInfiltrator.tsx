import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Search, ShieldCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEngagement } from "@/contexts/EngagementContext";

export default function CloudInfiltrator() {
  const [domain, setDomain] = useState("");
  const { selectedEngagementId } = useEngagement();
  const scan = trpc.cloud.scanBuckets.useMutation();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-cyan flex items-center gap-3">
            <Cloud className="h-8 w-8" />
            Cloud Infiltrator
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Enumerate and analyze public cloud infrastructure.
          </p>
        </div>

        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="terminal-text text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Bucket Enumeration
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="Target Domain (e.g., target-corp.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="font-mono"
            />
            <Button
              onClick={() =>
                selectedEngagementId &&
                scan.mutate({ engagementId: selectedEngagementId, domain })
              }
              disabled={!domain || !selectedEngagementId || scan.isPending}
            >
              {scan.isPending ? "Scanning..." : "Start Scan"}
            </Button>
          </CardContent>
        </Card>

        {scan.data && (
          <Card className="cyber-card">
            <CardHeader>
              <CardTitle className="terminal-text text-sm">
                Scan Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bucket Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scan.data.buckets.map((bucket: string) => (
                    <TableRow key={bucket}>
                      <TableCell className="font-mono">{bucket}</TableCell>
                      <TableCell>
                        <span className="status-active">DISCOVERED</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
