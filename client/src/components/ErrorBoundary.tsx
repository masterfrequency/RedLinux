import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-black">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 border border-red-500/30 bg-black/40 backdrop-blur-xl rounded-xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <AlertTriangle
              size={48}
              className="text-red-500 mb-6 flex-shrink-0 animate-pulse"
            />

            <h2 className="text-xl font-mono font-bold text-red-500 mb-4 uppercase tracking-tighter">
              CRITICAL SYSTEM ERROR
            </h2>

            <div className="p-4 w-full rounded border border-red-500/20 bg-red-500/5 overflow-auto mb-6">
              <pre className="text-xs font-mono text-red-400 whitespace-break-spaces">
                {this.state.error?.message ||
                  "An unexpected error occurred in the neural interface."}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded font-mono text-sm",
                  "bg-red-500 text-white",
                  "hover:bg-red-600 transition-colors cursor-pointer",
                )}
              >
                <RotateCcw size={16} />
                REBOOT
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded font-mono text-sm",
                  "border border-white/10 text-white",
                  "hover:bg-white/5 transition-colors cursor-pointer",
                )}
              >
                <Home size={16} />
                BASE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
