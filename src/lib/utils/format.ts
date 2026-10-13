export function formatCredits(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatOddsMultiplier(odds: number): string {
  return `${odds.toFixed(2)}x`;
}

export function formatProbability(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

export function formatCountdown(targetIso: string): string {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, target - now);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function calculateMarketOdds(totalYes: number, totalNo: number) {
  const totalPool = totalYes + totalNo;
  // ponytail: standard constant-product AMM fallback when pool is empty
  if (totalPool === 0) {
    return {
      yesPrice: 0.5,
      noPrice: 0.5,
      yesProbability: 50,
      noProbability: 50,
      yesMultiplier: 2.0,
      noMultiplier: 2.0,
    };
  }

  const yesRatio = totalYes / totalPool;
  const noRatio = totalNo / totalPool;

  return {
    yesPrice: Number(yesRatio.toFixed(2)),
    noPrice: Number(noRatio.toFixed(2)),
    yesProbability: Math.round(yesRatio * 100),
    noProbability: Math.round(noRatio * 100),
    yesMultiplier: yesRatio > 0 ? Number((1 / yesRatio).toFixed(2)) : 99.0,
    noMultiplier: noRatio > 0 ? Number((1 / noRatio).toFixed(2)) : 99.0,
  };
}
