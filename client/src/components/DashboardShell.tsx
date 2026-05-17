import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Globe,
  Network,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Database,
  Cloud,
  Users,
  FileCode,
  Activity,
  BrainCircuit,
  Zap,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  activeModule?: string;
  onModuleChange?: (module: string) => void;
}

const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "COMMAND CENTER",
    path: "/",
  },
  { id: "osint", icon: Globe, label: "AETHER-OSINT", path: "/osint" },
  { id: "network", icon: Network, label: "NETWORK INFIL", path: "/network" },
  { id: "harvest", icon: ShieldAlert, label: "CRED HARVEST", path: "/harvest" },
  {
    id: "specter",
    icon: ShieldCheck,
    label: "SPECTER EVASION",
    path: "/specter",
  },
  { id: "nexus", icon: AlertTriangle, label: "NEXUS EXPLOIT", path: "/nexus" },
  { id: "ghost", icon: Radio, label: "GHOST C2", path: "/ghost" },
  { id: "loot", icon: Database, label: "LOOT VAULT", path: "/loot" },
  { id: "cloud", icon: Cloud, label: "CLOUD INFIL", path: "/cloud" },
  { id: "social", icon: Users, label: "SOCIAL ARCH", path: "/social" },
  { id: "payload", icon: FileCode, label: "PAYLOAD GEN", path: "/payload" },
  { id: "exfil", icon: Activity, label: "EXFIL MONITOR", path: "/exfil" },
  { id: "ai", icon: BrainCircuit, label: "AI STRATEGIST", path: "/ai" },
  { id: "advanced", icon: Zap, label: "ULTRA ADVANCED", path: "/advanced" },
  { id: "security", icon: Settings, label: "SECURITY BASE", path: "/security" },
];

export default function DashboardShell({
  children,
  onModuleChange,
}: DashboardShellProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigate = (path: string, id: string) => {
    setLocation(path);
    if (onModuleChange) onModuleChange(id);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-mono selection:bg-primary/30 selection:text-primary">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-white/10 flex flex-col bg-black/40 backdrop-blur-xl transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 justify-between">
          <div
            className={cn(
              "flex items-center gap-3 group",
              !sidebarOpen && "hidden",
            )}
          >
            <div className="h-8 w-8 bg-primary/20 rounded flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tighter text-primary">
                REDLINUX
              </h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                Shadow Ops v4.1
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-white/5"
          >
            {sidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path, item.id)}
                  title={item.label}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-white",
                      )}
                    />
                    {sidebarOpen && (
                      <span className="text-[11px] font-bold uppercase tracking-tight">
                        {item.label}
                      </span>
                    )}
                  </div>
                  {sidebarOpen && isActive && (
                    <ChevronRight className="h-3 w-3 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8 border border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                {user?.name?.charAt(0).toUpperCase() || "OP"}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate text-primary uppercase">
                  {user?.name || "Operator"}
                </p>
                <p className="text-[9px] text-muted-foreground truncate uppercase">
                  Authenticated
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              "w-full justify-start h-8 px-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 text-[10px] font-bold uppercase",
              !sidebarOpen && "justify-center",
            )}
          >
            <LogOut className={cn("h-3 w-3", sidebarOpen && "mr-2")} />
            {sidebarOpen && "Terminate Session"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">
                System Online
              </span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="text-[10px] text-muted-foreground font-mono">
              LATENCY: 24MS | ENCRYPTION: AES-256-GCM
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                Network Load
              </span>
              <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div className="w-1/3 h-full bg-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {children}
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
      </main>
    </div>
  );
}
