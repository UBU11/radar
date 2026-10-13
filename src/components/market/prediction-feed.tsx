"use client";

import { usePowerSyncQuery } from "@/lib/powersync/hooks";
import { MarketCard, type MarketCardData } from "./market-card";
import { TrendingUp } from "lucide-react";

const INITIAL_FALLBACK_MARKETS: MarketCardData[] = [
  {
    id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    title: "Will CS 350 Midterm Average Fall Below 68%?",
    category: "ACADEMICS",
    resolutionCriteria: "Official grade distribution published on university portal by Friday 5 PM.",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
    totalPoolYes: 3420,
    totalPoolNo: 1890,
  },
  {
    id: "c9b2f6b8-4c12-4217-a9a7-9610f4d1e089",
    title: "Will the Main Campus Dining Hall Introduce Late Night Coffee Bar This Month?",
    category: "CAMPUS",
    resolutionCriteria: "Official campus dining board release or student government decree.",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    totalPoolYes: 1100,
    totalPoolNo: 2950,
  },
  {
    id: "b28a9f73-6734-453f-a67b-18a705e4d588",
    title: "Campus Hackathon: Will First Place Win Over 500 GitHub Stars in 48h?",
    category: "TECH",
    resolutionCriteria: "Public GitHub repository stargazers count verified at 48 hours post-closing.",
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    totalPoolYes: 4800,
    totalPoolNo: 3200,
  },
];

interface RawMarketRow {
  id: string;
  title: string;
  category: string;
  resolution_criteria: string;
  expiry_date: string;
  total_pool_yes: number;
  total_pool_no: number;
}

export function PredictionFeed() {
  const { data: rawMarkets, isLoading } = usePowerSyncQuery<RawMarketRow>(
    "SELECT id, title, category, resolution_criteria, expiry_date, total_pool_yes, total_pool_no FROM markets ORDER BY created_at DESC",
    [],
    []
  );

  const markets: MarketCardData[] =
    rawMarkets.length > 0
      ? rawMarkets.map((m) => ({
          id: m.id,
          title: m.title,
          category: m.category,
          resolutionCriteria: m.resolution_criteria,
          expiryDate: m.expiry_date,
          totalPoolYes: m.total_pool_yes,
          totalPoolNo: m.total_pool_no,
        }))
      : INITIAL_FALLBACK_MARKETS;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
          <h2 className="text-xs font-mono font-semibold tracking-wider text-white uppercase">
            ACTIVE CAMPUS MARKETS
          </h2>
        </div>
        <span className="text-[10px] font-mono tabular-nums text-neutral-500">
          {isLoading ? "POWERSYNC: CACHED" : "POWERSYNC: LIVE"}
        </span>
      </div>

      <div className="space-y-3">
        {markets.map((market) => (
          <MarketCard key={market.id} {...market} />
        ))}
      </div>
    </section>
  );
}
