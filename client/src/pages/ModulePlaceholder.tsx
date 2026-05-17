import DashboardLayout from "@/components/DashboardLayout";

export default function ModulePlaceholder({ title }: { title: string }) {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight terminal-text neon-glow-cyan">
            {title}
          </h1>
          <p className="text-muted-foreground terminal-sm">
            Module initialized. Waiting for operative configuration...
          </p>
        </div>
        <div className="cyber-card-lg">
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-accent/20 rounded-lg">
            <span className="terminal-text text-accent/50 animate-pulse">
              [ ACCESSING ENCRYPTED DATA STREAMS ]
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
