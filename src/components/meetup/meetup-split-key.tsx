"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { verifyMeetupSplitKeyAction } from "@/app/actions/meetup-actions";
import { KeyRound, ShieldCheck, MapPin, Clock, Lock } from "lucide-react";

interface MeetupSplitKeyProps {
  meetupId: string;
  initialVerified?: boolean;
}

export function MeetupSplitKey({
  meetupId,
  initialVerified = false,
}: MeetupSplitKeyProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [revealedName, setRevealedName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleVerifySplitKey = () => {
    setStatusMessage(null);
    startTransition(async () => {
      // Mock local user ID for boilerplate verification demo
      const result = await verifyMeetupSplitKeyAction({
        meetupId,
        userId: "00000000-0000-0000-0000-000000000001",
        proofToken: tokenInput.trim(),
      });

      if (!result.success) {
        setStatusMessage(result.error || "Split-key proof verification failed");
        return;
      }

      setIsVerified(true);
      setRevealedName(result.realName ?? null);
      setStatusMessage("Identity verified. Physical meetup unlocked.");
    });
  };

  return (
    <Card className="border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#00F0FF]" />
            <span>24-HR MEETUP PROTOCOL</span>
          </CardTitle>
          <Badge variant={isVerified ? "success" : "accent"}>
            {isVerified ? "VERIFIED" : "OFFLINE CRDT READY"}
          </Badge>
        </div>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Dual split-key physical handshake protocol
        </p>
      </CardHeader>

      <div className="space-y-3">
        <div className="bg-[#111111] border border-white/5 p-2.5 rounded-sm space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>CAMPUS COMMONS (NORTH ROTUNDA)</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>EXPIRES: 18h 42m</span>
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono">
            <span className="text-neutral-500">PEER IDENTITY:</span>
            {isVerified && revealedName ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{revealedName}</span>
              </span>
            ) : (
              <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>CONCEALED (REQUIRES KEY HANDSHAKE)</span>
              </span>
            )}
          </div>
        </div>

        {!isVerified ? (
          <div className="space-y-2">
            <label className="block text-[11px] font-mono text-neutral-400">
              INPUT PEER SPLIT-KEY TOKEN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="radar_key_9f82ab..."
                className="flex-1 bg-[#111111] border border-white/10 rounded-sm px-2.5 py-1.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-white/30"
              />
              <Button
                variant="accent"
                size="sm"
                className="font-mono text-xs whitespace-nowrap"
                onClick={handleVerifySplitKey}
                disabled={isPending || tokenInput.length < 5}
              >
                {isPending ? "VERIFYING..." : "MEETUP MODE"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-sm text-xs font-mono text-emerald-300">
            Split-key exchange complete. Encrypted local chat unlocked.
          </div>
        )}

        {statusMessage && (
          <div className="text-[11px] font-mono text-neutral-400">
            {statusMessage}
          </div>
        )}
      </div>
    </Card>
  );
}
