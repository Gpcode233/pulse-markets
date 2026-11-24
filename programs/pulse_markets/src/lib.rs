//! Pulse Markets — parametric micro-insurance on Solana.
//!
//! pm-AMM for binary payoffs. Each Shield has:
//!   * a USDC vault that fully collateralises every YES+NO pair
//!   * an AmmState with base liquidity L0 and expiry T
//!   * a Pyth-style price_update account used by resolve_shield
//!
//! Effective liquidity scales as sqrt(tau) where tau = max(0, (T - now) / T).
//! The YES price is a Gaussian CDF centred at 0.5 with sigma = 0.35 * sqrt(tau),
//! quoted in basis points (0..10_000).

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

declare_id!("PuLSe1111111111111111111111111111111111111");

#[program]
pub mod pulse_markets {
    use super::*;

    /// Create a new parametric shield market.
    pub fn initialize_shield(
        ctx: Context<InitializeShield>,
        shield_id: [u8; 16],
        trigger_threshold: i64,
        expiry_ts: i64,
        base_liquidity: u64,
        initial_probability_bps: u16, // 0..10_000
    ) -> Result<()> {
        require!(expiry_ts > Clock::get()?.unix_timestamp, PulseError::ExpiryInPast);
        require!(initial_probability_bps <= 10_000, PulseError::InvalidProbability);

        let shield = &mut ctx.accounts.shield;
        shield.authority = ctx.accounts.authority.key();
        shield.shield_id = shield_id;
        shield.usdc_mint = ctx.accounts.usdc_mint.key();
        shield.vault = ctx.accounts.vault.key();
        shield.yes_mint = ctx.accounts.yes_mint.key();
        shield.no_mint = ctx.accounts.no_mint.key();
        shield.price_feed = ctx.accounts.price_feed.key();
        shield.trigger_threshold = trigger_threshold;
        shield.start_ts = Clock::get()?.unix_timestamp;
        shield.expiry_ts = expiry_ts;
        shield.base_liquidity = base_liquidity;
        shield.probability_bps = initial_probability_bps;
        shield.total_yes = 0;
        shield.total_no = 0;
        shield.vault_usdc = 0;
        shield.status = ShieldStatus::Active as u8;
        shield.bump = ctx.bumps.shield;
        shield.vault_bump = ctx.bumps.vault;
        Ok(())
    }

    /// LPs deposit USDC and mint matched YES+NO pairs into the pool.
    pub fn underwrite_pool(ctx: Context<UnderwritePool>, usdc_amount: u64) -> Result<()> {
        let shield = &mut ctx.accounts.shield;
        require!(shield.status == ShieldStatus::Active as u8, PulseError::ShieldNotActive);
        require!(usdc_amount > 0, PulseError::ZeroAmount);

        // transfer USDC from LP -> vault
        let cpi = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.lp_usdc.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.lp.to_account_info(),
            },
        );
        token::transfer(cpi, usdc_amount)?;

        shield.vault_usdc = shield.vault_usdc.saturating_add(usdc_amount);
        shield.total_yes = shield.total_yes.saturating_add(usdc_amount);
        shield.total_no = shield.total_no.saturating_add(usdc_amount);

        // mint YES and NO to the LP
        let shield_key = shield.key();
        let seeds: &[&[u8]] = &[b"shield-auth", shield_key.as_ref(), &[shield.bump]];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.yes_mint.to_account_info(),
                    to: ctx.accounts.lp_yes.to_account_info(),
                    authority: ctx.accounts.shield.to_account_info(),
                },
                signer,
            ),
            usdc_amount,
        )?;
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.no_mint.to_account_info(),
                    to: ctx.accounts.lp_no.to_account_info(),
                    authority: ctx.accounts.shield.to_account_info(),
                },
                signer,
            ),
            usdc_amount,
        )?;
        Ok(())
    }

    /// Buy YES shares (protection) from the pm-AMM at the current price.
    pub fn buy_protection(ctx: Context<BuyProtection>, yes_shares: u64) -> Result<()> {
        let shield = &mut ctx.accounts.shield;
        require!(shield.status == ShieldStatus::Active as u8, PulseError::ShieldNotActive);
        require!(yes_shares > 0, PulseError::ZeroAmount);

        let now = Clock::get()?.unix_timestamp;
        let price_bps = price_yes_bps(shield.probability_bps, shield.start_ts, shield.expiry_ts, now);
        // premium = yes_shares * price / 10_000
        let premium = (yes_shares as u128)
            .checked_mul(price_bps as u128).unwrap()
            .checked_div(10_000).unwrap() as u64;
        require!(premium > 0, PulseError::ZeroAmount);

        // USDC in from buyer
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer_usdc.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            premium,
        )?;

        // mint YES to the buyer (shield PDA signs as mint authority)
        let shield_key = shield.key();
        let seeds: &[&[u8]] = &[b"shield-auth", shield_key.as_ref(), &[shield.bump]];
        let signer = &[&seeds[..]];
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.yes_mint.to_account_info(),
                    to: ctx.accounts.buyer_yes.to_account_info(),
                    authority: ctx.accounts.shield.to_account_info(),
                },
                signer,
            ),
            yes_shares,
        )?;

        shield.vault_usdc = shield.vault_usdc.saturating_add(premium);
        shield.total_yes = shield.total_yes.saturating_add(yes_shares);
        emit!(ProtectionBought { buyer: ctx.accounts.buyer.key(), yes_shares, premium, price_bps });
        Ok(())
    }

    /// Resolve the shield using the Pyth price feed account.
    pub fn resolve_shield(ctx: Context<ResolveShield>, observed_price: i64) -> Result<()> {
        let shield = &mut ctx.accounts.shield;
        require!(shield.status == ShieldStatus::Active as u8, PulseError::ShieldNotActive);
        let now = Clock::get()?.unix_timestamp;
        require!(now >= shield.expiry_ts, PulseError::NotYetExpired);
        // In production we'd parse PriceUpdateV2 from the pyth_solana_receiver_sdk and check staleness.
        require_keys_eq!(ctx.accounts.price_feed.key(), shield.price_feed, PulseError::WrongFeed);

        shield.resolved_price = observed_price;
        shield.status = if observed_price <= shield.trigger_threshold {
            ShieldStatus::Triggered as u8
        } else {
            ShieldStatus::Expired as u8
        };
        emit!(ShieldResolved { shield: shield.key(), triggered: shield.status == ShieldStatus::Triggered as u8, observed_price });
        Ok(())
    }

    /// Redeem YES ($1 each) if triggered, or NO ($1 each) if expired without trigger.
    pub fn claim_payout(ctx: Context<ClaimPayout>, shares: u64) -> Result<()> {
        let shield = &mut ctx.accounts.shield;
        require!(shares > 0, PulseError::ZeroAmount);
        let status = shield.status;
        require!(
            status == ShieldStatus::Triggered as u8 || status == ShieldStatus::Expired as u8,
            PulseError::ShieldNotResolved
        );

        // Burn the appropriate token.
        let (burn_mint, burn_from) = if status == ShieldStatus::Triggered as u8 {
            (ctx.accounts.yes_mint.to_account_info(), ctx.accounts.claimer_yes.to_account_info())
        } else {
            (ctx.accounts.no_mint.to_account_info(), ctx.accounts.claimer_no.to_account_info())
        };

        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Burn {
                    mint: burn_mint,
                    from: burn_from,
                    authority: ctx.accounts.claimer.to_account_info(),
                },
            ),
            shares,
        )?;

        // pay out USDC 1:1
        let shield_key = shield.key();
        let seeds: &[&[u8]] = &[b"shield-auth", shield_key.as_ref(), &[shield.bump]];
        let signer = &[&seeds[..]];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.claimer_usdc.to_account_info(),
                    authority: ctx.accounts.shield.to_account_info(),
                },
                signer,
            ),
            shares,
        )?;

        shield.vault_usdc = shield.vault_usdc.saturating_sub(shares);
        emit!(PayoutClaimed { claimer: ctx.accounts.claimer.key(), shares, triggered: status == ShieldStatus::Triggered as u8 });
        Ok(())
    }
}

// ----------------------------------------------------------------------------
// pm-AMM pricing (integer math, bps units)
// ----------------------------------------------------------------------------

/// Price of YES in basis points of a dollar (0..10_000).
///
///   tau   = max(0, (expiry - now) / (expiry - start))
///   sigma = 0.35 * sqrt(tau)
///   z     = (p - 0.5) / sigma
///   price = Phi(z)
///
/// Uses a rational approximation of the normal CDF. All math is done in i128
/// scaled by 1e6 then compressed back to bps.
pub fn price_yes_bps(prob_bps: u16, start_ts: i64, expiry_ts: i64, now_ts: i64) -> u16 {
    if now_ts >= expiry_ts {
        return if prob_bps >= 5_000 { 10_000 } else { 0 };
    }
    let span = (expiry_ts - start_ts).max(1) as i128;
    let left = (expiry_ts - now_ts).max(0) as i128;
    // tau in micros (1e6 == 1.0)
    let tau_u = (left * 1_000_000) / span;
    let sqrt_tau_u = isqrt(tau_u * 1_000_000); // sqrt scaled to 1e6
    // sigma = 0.35 * sqrt(tau)
    let sigma_u = (35 * sqrt_tau_u) / 100;
    if sigma_u == 0 {
        return if prob_bps >= 5_000 { 10_000 } else { 0 };
    }
    // (p - 0.5) in 1e6 scale
    let delta_u = (prob_bps as i128 - 5_000) * 100; // 1 bp == 100 in micros
    let z_u = (delta_u * 1_000_000) / sigma_u;
    let cdf_u = norm_cdf_micros(z_u); // 0..1_000_000
    // bps
    (cdf_u / 100).clamp(0, 10_000) as u16
}

/// Integer sqrt for i128 (Newton).
fn isqrt(n: i128) -> i128 {
    if n <= 0 { return 0; }
    let mut x = n;
    let mut y = (x + 1) / 2;
    while y < x {
        x = y;
        y = (x + n / x) / 2;
    }
    x
}

/// Abramowitz & Stegun normal CDF, returning 0..1_000_000.
/// Accepts z scaled by 1e6.
fn norm_cdf_micros(z_u: i128) -> i128 {
    let sign = if z_u < 0 { -1i128 } else { 1 };
    let az = z_u.unsigned_abs() as i128; // |z| * 1e6
    // |z|/sqrt(2)
    let x = (az * 707_107) / 1_000_000_000; // /sqrt(2) ~ *0.707107 -> result in 1e6
    // clamp extremes to avoid huge exp
    if x > 6_000_000 {
        return if sign > 0 { 1_000_000 } else { 0 };
    }

    // coefficients (1e9 scale)
    let a1: i128 =  254_829_592;
    let a2: i128 = -284_496_736;
    let a3: i128 = 1_421_413_741;
    let a4: i128 = -1_453_152_027;
    let a5: i128 = 1_061_405_429;
    let p_:  i128 =  327_591_100;

    // t = 1 / (1 + p*x). x is in 1e6, p_ is in 1e9, so p_*x is 1e15; divide by 1e6 to land in 1e9.
    let one_plus_px = 1_000_000_000i128 + (p_ * x) / 1_000_000;
    // t = 1 / (1 + p*x) in 1e9
    let t = 1_000_000_000i128 * 1_000_000_000 / one_plus_px; // 1e18/1e9 = 1e9

    // poly = (((a5*t + a4)*t + a3)*t + a2)*t + a1,  each *t drops 1e9, result 1e9
    let step = |acc: i128, coef: i128| -> i128 { (acc * t) / 1_000_000_000 + coef };
    let mut acc = a5;
    acc = step(acc, a4);
    acc = step(acc, a3);
    acc = step(acc, a2);
    acc = step(acc, a1);
    // poly * t -> 1e9
    let poly = (acc * t) / 1_000_000_000;

    // exp(-x^2) with x in 1e6 -> x^2 in 1e12, then e^(-x^2)
    let xsq = (x * x) / 1_000_000; // in 1e6
    let exp_neg = exp_neg_micros(xsq); // 0..1_000_000

    // y = 1 - poly * exp(-x^2) ; poly in 1e9, exp in 1e6 -> product /1e9 = 1e6
    let y = 1_000_000i128 - (poly * exp_neg) / 1_000_000_000;
    // cdf = 0.5*(1 + sign * y) in 1e6
    let v = 500_000i128 + sign * y / 2;
    v.clamp(0, 1_000_000)
}

/// exp(-x) for x >= 0, x in 1e6 scale, returns 0..1_000_000.
/// Uses series for small x and halving for large x.
fn exp_neg_micros(x_u: i128) -> i128 {
    if x_u <= 0 { return 1_000_000; }
    if x_u > 20_000_000 { return 0; }
    // split: exp(-x) = (exp(-x/16))^16 — pull x into a safe range
    let n = 16i128;
    let xr = x_u / n;
    // series: 1 - xr + xr^2/2 - xr^3/6 + xr^4/24 - xr^5/120
    let x1 = xr;
    let x2 = (x1 * xr) / 1_000_000;
    let x3 = (x2 * xr) / 1_000_000;
    let x4 = (x3 * xr) / 1_000_000;
    let x5 = (x4 * xr) / 1_000_000;
    let mut t = 1_000_000i128 - x1 + x2 / 2 - x3 / 6 + x4 / 24 - x5 / 120;
    if t < 0 { t = 0; }
    // pow 16 (square 4x)
    for _ in 0..4 {
        t = (t * t) / 1_000_000;
    }
    t.clamp(0, 1_000_000)
}

// ----------------------------------------------------------------------------
// Accounts
// ----------------------------------------------------------------------------

#[account]
pub struct Shield {
    pub authority: Pubkey,
    pub shield_id: [u8; 16],
    pub usdc_mint: Pubkey,
    pub vault: Pubkey,
    pub yes_mint: Pubkey,
    pub no_mint: Pubkey,
    pub price_feed: Pubkey,
    pub trigger_threshold: i64,
    pub resolved_price: i64,
    pub start_ts: i64,
    pub expiry_ts: i64,
    pub base_liquidity: u64,
    pub vault_usdc: u64,
    pub total_yes: u64,
    pub total_no: u64,
    pub probability_bps: u16,
    pub status: u8,
    pub bump: u8,
    pub vault_bump: u8,
}

impl Shield {
    pub const LEN: usize = 8  // discriminator
        + 32 + 16 + 32 + 32 + 32 + 32 + 32
        + 8 + 8 + 8 + 8
        + 8 + 8 + 8 + 8
        + 2 + 1 + 1 + 1
        + 32; // padding
}

#[repr(u8)]
pub enum ShieldStatus {
    Active = 0,
    Triggered = 1,
    Expired = 2,
}

// ----------------------------------------------------------------------------
// Contexts
// ----------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(shield_id: [u8; 16])]
pub struct InitializeShield<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Shield::LEN,
        seeds = [b"shield", shield_id.as_ref()],
        bump,
    )]
    pub shield: Account<'info, Shield>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = shield,
        seeds = [b"vault", shield.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 6,
        mint::authority = shield,
    )]
    pub yes_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 6,
        mint::authority = shield,
    )]
    pub no_mint: Account<'info, Mint>,

    /// CHECK: pyth price-update account; parsed off-chain in demo. Validated by pubkey match in resolve.
    pub price_feed: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UnderwritePool<'info> {
    #[account(mut, seeds = [b"shield", shield.shield_id.as_ref()], bump = shield.bump)]
    pub shield: Account<'info, Shield>,
    #[account(mut)]
    pub lp: Signer<'info>,
    #[account(mut, constraint = lp_usdc.mint == shield.usdc_mint)]
    pub lp_usdc: Account<'info, TokenAccount>,
    #[account(mut, address = shield.vault)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, address = shield.yes_mint)]
    pub yes_mint: Account<'info, Mint>,
    #[account(mut, address = shield.no_mint)]
    pub no_mint: Account<'info, Mint>,
    #[account(mut)]
    pub lp_yes: Account<'info, TokenAccount>,
    #[account(mut)]
    pub lp_no: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuyProtection<'info> {
    #[account(mut, seeds = [b"shield", shield.shield_id.as_ref()], bump = shield.bump)]
    pub shield: Account<'info, Shield>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut, constraint = buyer_usdc.mint == shield.usdc_mint)]
    pub buyer_usdc: Account<'info, TokenAccount>,
    #[account(mut, address = shield.vault)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, address = shield.yes_mint)]
    pub yes_mint: Account<'info, Mint>,
    #[account(mut)]
    pub buyer_yes: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ResolveShield<'info> {
    #[account(mut, seeds = [b"shield", shield.shield_id.as_ref()], bump = shield.bump)]
    pub shield: Account<'info, Shield>,
    pub authority: Signer<'info>,
    /// CHECK: resolved vs stored price_feed pubkey
    pub price_feed: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(mut, seeds = [b"shield", shield.shield_id.as_ref()], bump = shield.bump)]
    pub shield: Account<'info, Shield>,
    #[account(mut)]
    pub claimer: Signer<'info>,
    #[account(mut, address = shield.yes_mint)]
    pub yes_mint: Account<'info, Mint>,
    #[account(mut, address = shield.no_mint)]
    pub no_mint: Account<'info, Mint>,
    #[account(mut)]
    pub claimer_yes: Account<'info, TokenAccount>,
    #[account(mut)]
    pub claimer_no: Account<'info, TokenAccount>,
    #[account(mut, constraint = claimer_usdc.mint == shield.usdc_mint)]
    pub claimer_usdc: Account<'info, TokenAccount>,
    #[account(mut, address = shield.vault)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

// ----------------------------------------------------------------------------
// Events + errors
// ----------------------------------------------------------------------------

#[event]
pub struct ProtectionBought { pub buyer: Pubkey, pub yes_shares: u64, pub premium: u64, pub price_bps: u16 }
#[event]
pub struct ShieldResolved  { pub shield: Pubkey, pub triggered: bool, pub observed_price: i64 }
#[event]
pub struct PayoutClaimed   { pub claimer: Pubkey, pub shares: u64, pub triggered: bool }

#[error_code]
pub enum PulseError {
    #[msg("Expiry must be in the future")]        ExpiryInPast,
    #[msg("Probability must be <= 10000 bps")]    InvalidProbability,
    #[msg("Shield not active")]                   ShieldNotActive,
    #[msg("Shield has not yet expired")]          NotYetExpired,
    #[msg("Shield not resolved")]                 ShieldNotResolved,
    #[msg("Wrong price feed account")]            WrongFeed,
    #[msg("Amount must be non-zero")]             ZeroAmount,
}
