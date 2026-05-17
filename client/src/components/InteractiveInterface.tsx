import React, { useState } from "react";

interface Hotspot {
  id: string;
  top: string;
  left: string;
  width: string;
  height: string;
  label: string;
  action: () => void;
}

interface InteractiveInterfaceProps {
  imageSrc: string;
  hotspots: Hotspot[];
  title: string;
}

export default function InteractiveInterface({
  imageSrc,
  hotspots,
  title,
}: InteractiveInterfaceProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-primary/20 bg-black shadow-2xl">
      <div className="absolute top-0 left-0 z-10 p-4 bg-black/60 backdrop-blur-md border-b border-r border-primary/20 rounded-br-lg">
        <h2 className="text-xl font-mono font-bold text-primary animate-pulse">
          {title}
        </h2>
        <div className="text-[10px] text-primary/60 font-mono mt-1 uppercase tracking-widest">
          Interactive Neural Overlay Active
        </div>
      </div>

      <div className="relative aspect-video w-full">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover opacity-80"
        />

        {/* Hotspots Overlay */}
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className={`absolute cursor-pointer transition-all duration-300 border-2 ${
              hoveredHotspot === hotspot.id
                ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.5)] scale-105"
                : "border-transparent bg-transparent"
            }`}
            style={{
              top: hotspot.top,
              left: hotspot.left,
              width: hotspot.width,
              height: hotspot.height,
              zIndex: 20,
            }}
            onMouseEnter={() => setHoveredHotspot(hotspot.id)}
            onMouseLeave={() => setHoveredHotspot(null)}
            onClick={hotspot.action}
          >
            {hoveredHotspot === hotspot.id && (
              <div className="absolute -top-8 left-0 px-2 py-1 bg-primary text-black text-[10px] font-bold whitespace-nowrap rounded uppercase tracking-tighter">
                {hotspot.label}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-black/40 border-t border-primary/10 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-[10px] font-mono text-green-500 uppercase">
              System Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[10px] font-mono text-primary uppercase">
              Neural Link Established
            </span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground italic">
          Click highlighted sectors to execute sub-routines
        </div>
      </div>
    </div>
  );
}
