import assert from "node:assert/strict";

async function main() {
  const { computePinHash, verifyOfflinePin } = await import("../src/lib/crypto/meetup-pin.ts");
  const { generateUuidV7 } = await import("../src/lib/utils/uuidv7.ts");
  const { calculateMarketOdds } = await import("../src/lib/utils/format.ts");
  const { ATOMIC_BET_LUA_SCRIPT } = await import("../src/lib/betting/lua-script.ts");
  const { BetInputSchema } = await import("../src/types/market.ts");

  // 1. Verify WebCrypto offline PIN hash
  const pin = "4821";
  const meetupId = "00000000-0000-0000-0000-000000000002";
  const salt = "campus_rotunda_salt";
  const computedHash = await computePinHash(pin, meetupId, salt);
  assert.equal(typeof computedHash, "string");
  assert.equal(computedHash.length, 64);

  const isValid = await verifyOfflinePin(pin, meetupId, salt, computedHash);
  assert.equal(isValid, true);

  const isInvalid = await verifyOfflinePin("9999", meetupId, salt, computedHash);
  assert.equal(isInvalid, false);

  // 2. Verify UUIDv7 RFC 9562 version 7 bit
  const uuid = generateUuidV7();
  assert.match(uuid, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

  // 3. Verify Market Odds calculation
  const odds = calculateMarketOdds(300, 100);
  assert.equal(odds.yesProbability, 75);
  assert.equal(odds.noProbability, 25);
  assert.equal(odds.yesMultiplier, 1.33);
  assert.equal(odds.noMultiplier, 4.0);

  // 4. Verify Shared Lua Script integrity
  assert.ok(ATOMIC_BET_LUA_SCRIPT.includes("INSUFFICIENT_BALANCE"));
  assert.ok(ATOMIC_BET_LUA_SCRIPT.includes("DUPLICATE"));
  assert.ok(ATOMIC_BET_LUA_SCRIPT.includes("SETEX"));

  // 5. Verify BetInputSchema validation
  const validBet = BetInputSchema.safeParse({
    idempotencyKey: uuid,
    marketId: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    userId: "00000000-0000-0000-0000-000000000001",
    outcome: "YES",
    amount: 50,
  });
  assert.equal(validBet.success, true);

  const invalidBet = BetInputSchema.safeParse({
    idempotencyKey: "not-a-uuid",
    marketId: "123",
    userId: "123",
    outcome: "MAYBE",
    amount: -10,
  });
  assert.equal(invalidBet.success, false);

  console.log("PASS: All radar core architecture checks succeeded.");
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});
