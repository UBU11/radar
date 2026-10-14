"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePowerSyncQuery } from "@/lib/powersync/hooks";
import { getPowerSyncClient } from "@/lib/powersync/client";
import { verifyOfflinePin } from "@/lib/crypto/meetup-pin";
import { verifyMeetupPinAction } from "@/app/actions/meetup-actions";
import { KeyRound, ShieldCheck, MapPin, Clock, Lock, Check } from "lucide-react";

interface MeetupRow {
  id: string;
  market_id: string;
  user_a_id: string;
  user_b_id: string;
  status: string;
  meetup_verified: number;
  pin_hash: string;
  salt: string;
  expires_at: string;
}

interface MeetupRoomProps {
  meetupId: string;
}

export function MeetupRoom({ meetupId }: MeetupRoomProps) {
  const [pinInput, setPinInput] = useState("");
  const [localVerified, setLocalVerified] = useState(false);
  const [peerRealName, setPeerRealName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fallbackMeetup: MeetupRow = {
    id: meetupId,
    market_id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    user_a_id: "00000000-0000-0000-0000-000000000001",
    user_b_id: "00000000-0000-0000-0000-000000000002",
    status: "pending",
    meetup_verified: 0,
    pin_hash: "8c7dd0f3de03bd4663e809f6e52ca0c495c02b28c5a2c4224c6ef34a04d8fc3d",
    salt: "campus_rotunda_salt",
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
  };

  const { records: meetupRows } = usePowerSyncQuery<MeetupRow>(
    "SELECT id, market_id, user_a_id, user_b_id, status, meetup_verified, pin_hash, salt, expires_at FROM meetups WHERE id = ?",
    [meetupId],
    [fallbackMeetup]
  );

  const meetup = meetupRows[0] || fallbackMeetup;
  const isVerified = localVerified || meetup.meetup_verified === 1;

  const confirmMeetupPin = () => {
    if (pinInput.length !== 4) return;
    setStatusMessage(null);

    startTransition(async () => {
      const isOfflineValid = await verifyOfflinePin(
        pinInput,
        meetup.id,
        meetup.salt,
        meetup.pin_hash
      );

      if (isOfflineValid) {
        setLocalVerified(true);
        setStatusMessage("Offline handshake verified via WebCrypto.");

        try {
          const db = getPowerSyncClient();
          await db.execute(
            "UPDATE meetups SET meetup_verified = 1, status = 'verified' WHERE id = ?",
            [meetup.id]
          );
        } catch {
          // Dev fallback when local database table is mock
        }
      }

      const syncResult = await verifyMeetupPinAction({
        meetupId: meetup.id,
        userId: "00000000-0000-0000-0000-000000000001",
        pin: pinInput,
      });

      if (syncResult.success && syncResult.realName) {
        setPeerRealName(syncResult.realName);
        setStatusMessage("Identity unlocked via double-blind verification.");
      } else if (!isOfflineValid) {
        setStatusMessage(syncResult.error || "PIN verification failed.");
      }
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
              <span className="tabular-nums">EXPIRES: 18h 42m</span>
            </span>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono">
            <span className="text-neutral-500">PEER IDENTITY:</span>
            {isVerified ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{peerRealName ?? "VERIFIED PARTICIPANT"}</span>
              </span>
            ) : (
              <span className="text-neutral-400 flex items-center gap-1 text-[11px]">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>CONCEALED (REQUIRES 4-DIGIT PIN)</span>
              </span>
            )}
          </div>
        </div>

        {!isVerified ? (
          <div className="space-y-2">
            <label className="block text-[11px] font-mono text-neutral-400">
              ENTER 4-DIGIT PHYSICAL MEETUP PIN
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                placeholder="4821"
                className="w-24 bg-[#111111] border border-white/10 rounded-sm px-2.5 py-1.5 text-xs text-white font-mono tabular-nums text-center tracking-widest placeholder-neutral-600 focus:outline-none focus:border-white/30"
              />
              <Button
                variant="accent"
                size="sm"
                className="flex-1 font-mono text-xs whitespace-nowrap"
                onClick={confirmMeetupPin}
                disabled={isPending || pinInput.length !== 4}
              >
                {isPending ? "VERIFYING..." : "CONFIRM PIN"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-sm text-xs font-mono text-emerald-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic handshake confirmed. Physical meetup active.</span>
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
