/**
 * pm-AMM reference pricer (JS) — matches programs/pulse_markets/src/lib.rs.
 *
 * Idea:
 *   YES/NO are binary tokens worth $1 or $0 at expiry.
 *   Effective liquidity collapses to zero as t -> T:  L(t) = L0 * sqrt(tau)  where tau = max(0, (T-t)/T).
 *   Price of YES is a Gaussian CDF centred at 0.5 with sigma scaled by sqrt(tau),
 *   so informed flow cannot run over the LP near resolution (minimises LVR).
 */

// Abramowitz & Stegun approximation of the normal CDF.
export function normCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return 0.5 * (1 + sign * y);
}

/**
 * Price YES, given:
 *   p      — current implied probability (0..1) from external belief
 *   tau    — normalised time to expiry in [0,1]
 *   L      — base liquidity, informational (does not affect price here, only slippage)
 * Returns price of YES in USDC ($0..$1).
 */
export function priceYes(p: number, tau: number, _L: number = 1_000_000): number {
  const clampedTau = Math.max(1e-4, Math.min(1, tau));
  // sigma shrinks as tau shrinks -> price slams toward 0 or 1 as expiry nears
  const sigma = 0.35 * Math.sqrt(clampedTau);
  const z = (p - 0.5) / sigma;
  return Math.min(0.999, Math.max(0.001, normCdf(z)));
}

export function priceNo(p: number, tau: number, L: number = 1_000_000): number {
  return 1 - priceYes(p, tau, L);
}

/**
 * Given a user's portfolio size and desired coverage %, return:
 *   coverageUsd   — guaranteed payout if trigger fires
 *   yesPrice      — current $ price per YES share
 *   sharesNeeded  — coverageUsd shares to redeem $1 each
 *   premium       — total USDC the user pays today
 *   premiumPct    — premium / coverageUsd
 */
export interface Quote {
  coverageUsd: number;
  yesPrice: number;
  sharesNeeded: number;
  premium: number;
  premiumPct: number;
}

export function premiumForCoverage(
  portfolioUsd: number,
  coveragePct: number, // 0..1
  probability: number, // 0..1
  tau: number,
  L: number = 1_000_000,
): Quote {
  const coverageUsd = portfolioUsd * coveragePct;
  const yesPrice = priceYes(probability, tau, L);
  const sharesNeeded = coverageUsd; // each YES pays $1
  const premium = sharesNeeded * yesPrice;
  const premiumPct = coverageUsd === 0 ? 0 : premium / coverageUsd;
  return { coverageUsd, yesPrice, sharesNeeded, premium, premiumPct };
}

/** APY projection for an LP underwriting the pool. */
export function projectedApy(poolUsdc: number, weeklyPremiumUsdc: number): number {
  if (poolUsdc <= 0) return 0;
  const weekly = weeklyPremiumUsdc / poolUsdc;
  return Math.min(2, weekly * 52);
}

/** Decay curve sample for the inline SVG sparkline in ShieldCard. */
export function decayCurve(samples = 40): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < samples; i++) {
    const tau = 1 - i / (samples - 1);
    pts.push({ x: i / (samples - 1), y: Math.sqrt(Math.max(0, tau)) });
  }
  return pts;
}
