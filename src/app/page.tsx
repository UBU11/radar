import { TerminalHeader } from "@/components/terminal/terminal-header";
import { MarketCard } from "@/components/market/market-card";
import { BettingPanel } from "@/components/market/betting-panel";
import { MarketChat } from "@/components/chat/market-chat";
import { MeetupSplitKey } from "@/components/meetup/meetup-split-key";
import { TrendingUp, Radio } from "lucide-react";

// Mock campus prediction polls representing initial state
const INITIAL_MARKETS = [
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

export default function HomePage() {
  const selectedMarket = INITIAL_MARKETS[0];

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <TerminalHeader initialBalance={1250.0} marketCount={INITIAL_MARKETS.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column: Active Prediction Markets (RSC) */}
        <section className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
              <h2 className="text-xs font-mono font-semibold tracking-wider text-white uppercase">
                ACTIVE CAMPUS MARKETS
              </h2>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">LIVE FEED // WEBSOCKETS</span>
          </div>

          <div className="space-y-3">
            {INITIAL_MARKETS.map((market) => (
              <MarketCard key={market.id} {...market} />
            ))}
          </div>
        </section>

        {/* Right Column: High-throughput Order Entry, Chat & Meetup Protocol */}
        <aside className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00F0FF]" />
              <h2 className="text-xs font-mono font-semibold tracking-wider text-white uppercase">
                EXECUTION & PROTOCOL
              </h2>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">ISOLATED ENCLAVE</span>
          </div>

          {/* Interactive Order Entry connected to Upstash Redis queue */}
          <BettingPanel
            marketId={selectedMarket.id}
            marketTitle={selectedMarket.title}
            yesMultiplier={1.55}
            noMultiplier={2.8}
          />

          {/* Offline-First 24-Hour Meetup Protocol */}
          <MeetupSplitKey meetupId="00000000-0000-0000-0000-000000000002" />

          {/* Live Anonymous Market Discussion */}
          <MarketChat marketId={selectedMarket.id} />
        </aside>
      </main>
    </div>
  );
}
