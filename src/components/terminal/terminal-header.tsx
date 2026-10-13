"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCredits } from "@/lib/utils/format";
import { Activity, ShieldCheck, Wifi, WifiOff } from "lucide-react";

interface TerminalHeaderProps {
  initialBalance?: number;
  marketCount?: number;
}

export function TerminalHeader({ initialBalance = 1000.0, marketCount = 12 }: TerminalHeaderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [balance] = useState(initialBalance);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <header className="w-full bg-black border-b border-white/10 px-4 py-2.5 flex items-center justify-between select-none">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
          <span className="font-mono text-xs tracking-widest text-white uppercase font-bold">RADAR // TERMINAL</span>
        </div>
        <span className="text-white/20 text-xs">|</span>
        <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1">
          <Activity className="w-3 h-3 text-[#00F0FF]" />
          <span className="tabular-nums">MARKETS: {marketCount}</span>
        </Badge>
        <Badge variant={isOnline ? "success" : "warning"} className="flex items-center gap-1">
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? "POWERSYNC: SYNCED" : "LOCAL-FIRST: OFFLINE"}</span>
        </Badge>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5 text-xs text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline font-mono text-[11px]">RLS & SPLIT-KEY ACTIVE</span>
        </div>
        <div className="bg-[#111111] border border-white/10 px-2.5 py-1 rounded-sm flex items-center space-x-2">
          <span className="text-[10px] uppercase font-mono text-neutral-400">CREDITS</span>
          <span className="font-mono tabular-nums text-xs font-semibold text-[#00F0FF]">
            ${formatCredits(balance)}
          </span>
        </div>
      </div>
    </header>
  );
}
