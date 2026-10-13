import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateMarketOdds, formatCountdown, formatProbability, formatOddsMultiplier } from "@/lib/utils/format";
import { Clock, ShieldAlert } from "lucide-react";

export interface MarketCardData {
  id: string;
  title: string;
  category: string;
  resolutionCriteria: string;
  expiryDate: string;
  totalPoolYes: number;
  totalPoolNo: number;
}

interface MarketCardProps extends MarketCardData {
  onSelectMarket?: (marketId: string) => void;
}

export function MarketCard({
  title,
  category,
  resolutionCriteria,
  expiryDate,
  totalPoolYes,
  totalPoolNo,
}: MarketCardProps) {
  const odds = calculateMarketOdds(totalPoolYes, totalPoolNo);

  return (
    <Card className="hover:border-white/20 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">{category}</Badge>
          <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="tabular-nums">{formatCountdown(expiryDate)}</span>
          </div>
        </div>
        <CardTitle className="mt-1 text-sm leading-snug">{title}</CardTitle>
        <CardDescription className="line-clamp-2 text-[11px] text-neutral-400 mt-0.5">
          {resolutionCriteria}
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-[#111111] border border-white/10 p-2 rounded-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">YES ODDS</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono tabular-nums text-base font-bold text-white">
              {formatProbability(odds.yesProbability)}
            </span>
            <span className="font-mono tabular-nums text-xs text-neutral-400">
              {formatOddsMultiplier(odds.yesMultiplier)}
            </span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 p-2 rounded-sm flex flex-col justify-between">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">NO ODDS</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-mono tabular-nums text-base font-bold text-white">
              {formatProbability(odds.noProbability)}
            </span>
            <span className="font-mono tabular-nums text-xs text-neutral-400">
              {formatOddsMultiplier(odds.noMultiplier)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-1 font-mono">
          <ShieldAlert className="w-3 h-3 text-neutral-500" />
          <span className="tabular-nums">POOL: ${(totalPoolYes + totalPoolNo).toLocaleString()}</span>
        </div>
        <span className="font-mono text-[10px] text-neutral-400">RESOLVES BY REGISTRAR</span>
      </div>
    </Card>
  );
}
