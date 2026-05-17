import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useEngagement } from "@/contexts/EngagementContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ShieldCheck, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CredentialHarvester() {
  const { selectedEngagementId } = useEngagement();

  const { data: items, isLoading } = trpc.loot.getItems.useQuery(
    { engagementId: selectedEngagementId || 0 },
    { enabled: !!selectedEngagementId },
  );

  const credentials =
    items?.filter((item) => item.itemType === "credential") || [];

  return (
    <DashboardLayout
      title="Credential Harvester"
      subtitle="Neural Interception v4.1"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="cyber-card border-primary/20 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase">
                Total Captured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold terminal-text neon-glow-cyan">
                {credentials.length}
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card border-primary/20 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase">
                Active Listeners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold terminal-text neon-glow-lime">
                3
              </div>
            </CardContent>
          </Card>
          <Card className="cyber-card border-primary/20 bg-black/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground uppercase">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold terminal-text neon-glow-magenta">
                94%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="cyber-card border-primary/20 bg-black/40">
          <CardHeader>
            <CardTitle className="text-sm font-mono flex items-center gap-2 text-primary">
              <Key className="h-4 w-4" /> CAPTURED ASSETS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : credentials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                [ NO CREDENTIALS INTERCEPTED ]
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                      Asset Name
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                      Category
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                      Source
                    </TableHead>
                    <TableHead className="text-muted-foreground font-mono text-xs uppercase">
                      Captured At
                    </TableHead>
                    <TableHead className="text-right text-muted-foreground font-mono text-xs uppercase">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-white/5 hover:bg-white/5"
                    >
                      <TableCell className="font-mono text-sm text-primary">
                        {item.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.category}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.source || "Unknown"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="text-[10px] border-lime-500/30 text-lime-400 uppercase"
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
