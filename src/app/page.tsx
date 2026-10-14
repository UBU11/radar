import { TerminalHeader } from "@/components/terminal/terminal-header";
import { PredictionFeed } from "@/components/market/prediction-feed";
import { BettingPanel } from "@/components/market/betting-panel";
import { MeetupRoom } from "@/components/meetup/meetup-room";
import { AnonymousChat } from "@/components/chat/anonymous-chat";
import { Radio } from "lucide-react";

export default function HomePage() {
  const activeMarketId = "f81d4fae-7dec-11d0-a765-00a0c91e6bf6";
  const activeMeetupId = "00000000-0000-0000-0000-000000000002";

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <TerminalHeader initialBalance={1250.0} marketCount={3} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        <div className="lg:col-span-7">
          <PredictionFeed />
        </div>

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

          <BettingPanel
            marketId={activeMarketId}
            marketTitle="Will CS 350 Midterm Average Fall Below 68%?"
            yesMultiplier={1.55}
            noMultiplier={2.8}
          />

          <MeetupRoom meetupId={activeMeetupId} />

          <AnonymousChat marketId={activeMarketId} />
        </aside>
      </main>
    </div>
  );
}
