import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Database, Lock, Loader2 } from "lucide-react";
import { useEngagement } from "@/contexts/EngagementContext";

export default function LootVault() {
  const { selectedEngagementId } = useEngagement();
  const { data: items, isLoading } = trpc.loot.getItems.useQuery(
    { engagementId: selectedEngagementId || 0 },
    { enabled: !!selectedEngagementId },
  );

  return (
    <DashboardLayout title="Loot Vault" subtitle="Encrypted Asset Storage">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-magenta flex items-center gap-3">
            <Database className="h-8 w-8" />
            Loot Vault
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Encrypted storage for captured data and credentials.
          </p>
        </div>

        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="terminal-text text-sm">
              Loot Explorer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !items || items.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground font-mono uppercase">
                No loot items recovered
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="terminal-text">Item Name</TableHead>
                    <TableHead className="terminal-text">Type</TableHead>
                    <TableHead className="terminal-text">Category</TableHead>
                    <TableHead className="terminal-text">Security</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-accent">
                        {item.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.itemType.toUpperCase()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.category}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-lime-400 text-xs">
                          <Lock className="h-3 w-3" /> ENCRYPTED
                        </div>
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
