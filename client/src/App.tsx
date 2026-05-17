import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import NetworkInfiltrator from "@/pages/NetworkInfiltrator";
import CredentialHarvester from "@/pages/CredentialHarvester";
import AIStrategist from "@/pages/AIStrategist";
import SpecterEvasion from "@/pages/SpecterEvasion";
import NexusExploit from "@/pages/NexusExploit";
import GhostC2 from "@/pages/GhostC2";
import LootVault from "@/pages/LootVault";
import CloudInfiltrator from "@/pages/CloudInfiltrator";
import SocialArchitect from "@/pages/SocialArchitect";
import PayloadGenerator from "@/pages/PayloadGenerator";
import ExfiltrationMonitor from "@/pages/ExfiltrationMonitor";
import UltraAdvanced from "@/pages/UltraAdvanced";
import Security from "@/pages/Security";
import OSINTNexus from "@/pages/OSINTNexus";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { useAuth } from "@/_core/hooks/useAuth";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="terminal-text text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return (
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" component={Dashboard} />
        <Route path="/osint" component={OSINTNexus} />
        <Route path="/network" component={NetworkInfiltrator} />
        <Route path="/harvest" component={CredentialHarvester} />
        <Route path="/specter" component={SpecterEvasion} />
        <Route path="/nexus" component={NexusExploit} />
        <Route path="/ghost" component={GhostC2} />
        <Route path="/loot" component={LootVault} />
        <Route path="/cloud" component={CloudInfiltrator} />
        <Route path="/social" component={SocialArchitect} />
        <Route path="/payload" component={PayloadGenerator} />
        <Route path="/exfil" component={ExfiltrationMonitor} />
        <Route path="/ai" component={AIStrategist} />
        <Route path="/advanced" component={UltraAdvanced} />
        <Route path="/security" component={Security} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show home page for unauthenticated users
  return (
    <Switch>
      <Route path="" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
