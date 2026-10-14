export const ATOMIC_BET_LUA_SCRIPT = `
local userBalanceKey = KEYS[1]
local marketPoolKey = KEYS[2]
local queueKey = KEYS[3]
local idempotencyKey = KEYS[4]

local betAmount = tonumber(ARGV[1])
local betPayload = ARGV[2]

if redis.call('EXISTS', idempotencyKey) == 1 then
  return { 'DUPLICATE', redis.call('GET', idempotencyKey) }
end

local currentBalance = tonumber(redis.call('GET', userBalanceKey) or '1000')

if currentBalance < betAmount then
  return { 'INSUFFICIENT_BALANCE', tostring(currentBalance) }
end

local newBalance = currentBalance - betAmount
redis.call('SET', userBalanceKey, tostring(newBalance))
redis.call('INCRBYFLOAT', marketPoolKey, betAmount)
redis.call('LPUSH', queueKey, betPayload)
redis.call('SETEX', idempotencyKey, 86400, 'CONFIRMED')

return { 'SUCCESS', tostring(newBalance) }
`;
