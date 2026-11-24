# Pulse Markets — Parametric Micro-Insurance on Solana

Built for the [Solana Perps and Prediction Markets Hackathon](https://hackathons.solana.com/hackathons/perps-and-prediction-markets).

Pulse Markets issues **48–72 hour parametric shields** priced by a **pm-AMM** (prediction-market AMM with Gaussian time-decay liquidity, see [predict-pm-amm.dev](https://predict-pm-amm.dev)). Users buy YES shares to hedge SOL drawdowns, DeFi protocol downtime, or gas spikes. Every YES+NO pair is fully backed 1:1 by USDC in the vault. A Pyth price feed resolves the shield at expiry: YES redeems $1 if the parametric trigger fires, else $0.

## Architecture

```
          ┌──────────────────────────────────────────────┐
          │   Next.js 14 App Router (src/app)            │
          │   Tailwind v4 + Shadcn (Column design)       │
          │   Wallet Adapter (Phantom/Solflare/Backpack) │
          └───────────────┬──────────────────────────────┘
                          │  @solana/web3.js
                          ▼
          ┌──────────────────────────────────────────────┐
          │   Anchor program: pulse_markets              │
          │   programs/pulse_markets/src/lib.rs          │
          │                                              │
          │   instructions:                              │
          │     initialize_shield                        │
          │     underwrite_pool                          │
          │     buy_protection                           │
          │     resolve_shield                           │
          │     claim_payout                             │
          │                                              │
          │   PDAs: Shield, Vault, AmmState              │
          └───────────────┬──────────────────────────────┘
                          │  CPI
             ┌────────────┴────────────┐
             ▼                         ▼
      ┌──────────────┐          ┌──────────────┐
      │ USDC Vault   │          │ Pyth feed    │
      │ (SPL Token)  │          │ (SOL/USD)    │
      └──────────────┘          └──────────────┘
```

## pm-AMM math (why Gaussian liquidity solves LVR)

A prediction-market AMM has unique dynamics because the terminal value is **binary** (0 or 1), not a lognormal asset. A naïve constant-product AMM bleeds **Loss-vs-Rebalancing (LVR)** on every resolution because the final price jump of 50 → 100 or 50 → 0 is the entire payoff.

The **pm-AMM** solves this by scaling effective liquidity `L` by `tau = max(0, T - t) / T`:

```
L_effective(t) = L0 · sqrt(tau)
price_yes(p, tau, L) = Φ( (p - 0.5) / (σ · sqrt(tau)) )
```

As expiry approaches (`tau → 0`), liquidity collapses and spreads widen, so the LP cannot be run over by informed traders in the terminal jump. The curve shape is a **Gaussian CDF** centered at 0.5 — probabilistic pricing exactly matches the belief distribution of traders. For short-horizon (48–72h) parametric events this is the single best AMM design: it minimizes LVR, matches binary payoff geometry, and quotes a clean implied probability any LP can underwrite against.

See `src/lib/pmAmm.ts` for the JS reference pricer and `programs/pulse_markets/src/lib.rs::price_yes_bps` for the on-chain version (fixed-point basis points).

## Devnet deploy

```bash
# frontend
npm install
npm run dev

# program
cd programs/pulse_markets
anchor build
anchor deploy --provider.cluster devnet
anchor test
```

## Demo mode

The app runs end-to-end without a wallet. Demo Mode is on by default:

- Slider changes recompute premium instantly via `pmAmm.ts`.
- **Activate Shield** mocks a tx hash and shows a coverage summary dialog.
- **Simulate Oracle Shock & Claim Payout** flips a shield to `TRIGGERED` and enables the claim CTA.

## Links

- Hackathon: https://hackathons.solana.com/hackathons/perps-and-prediction-markets
- pm-AMM paper: https://predict-pm-amm.dev
