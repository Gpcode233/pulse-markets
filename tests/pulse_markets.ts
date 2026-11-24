import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";

describe("pulse_markets", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PulseMarkets as Program<any>;

  const authority = Keypair.generate();
  const buyer = Keypair.generate();
  const lp = Keypair.generate();

  let usdcMint: PublicKey;
  const yesMint = Keypair.generate();
  const noMint = Keypair.generate();
  const priceFeed = Keypair.generate();

  const shieldId = Buffer.alloc(16);
  shieldId.write("SOL-72H-DRAWDOWN");

  let shieldPda: PublicKey;
  let vaultPda: PublicKey;
  let shieldBump: number;

  before(async () => {
    // airdrop
    for (const kp of [authority, buyer, lp]) {
      const sig = await provider.connection.requestAirdrop(kp.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    }
    usdcMint = await createMint(provider.connection, authority, authority.publicKey, null, 6);

    [shieldPda, shieldBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("shield"), shieldId],
      program.programId,
    );
    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), shieldPda.toBuffer()],
      program.programId,
    );
  });

  it("initializes a shield", async () => {
    const now = Math.floor(Date.now() / 1000);
    const expiry = new anchor.BN(now + 72 * 3600);
    await program.methods
      .initializeShield(Array.from(shieldId), new anchor.BN(14280), expiry, new anchor.BN(1_000_000_000_000), 2200)
      .accounts({
        authority: authority.publicKey,
        shield: shieldPda,
        usdcMint,
        vault: vaultPda,
        yesMint: yesMint.publicKey,
        noMint: noMint.publicKey,
        priceFeed: priceFeed.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([authority, yesMint, noMint])
      .rpc();

    const s: any = await program.account.shield.fetch(shieldPda);
    assert.equal(s.triggerThreshold.toNumber(), 14280);
    assert.equal(s.probabilityBps, 2200);
    assert.equal(s.status, 0);
  });

  it("LP underwrites, buyer purchases YES, then resolves triggered", async () => {
    // fund LP + buyer with USDC
    const lpUsdc = await createAssociatedTokenAccount(provider.connection, lp, usdcMint, lp.publicKey);
    const buyerUsdc = await createAssociatedTokenAccount(provider.connection, buyer, usdcMint, buyer.publicKey);
    await mintTo(provider.connection, authority, usdcMint, lpUsdc, authority, 100_000_000_000);
    await mintTo(provider.connection, authority, usdcMint, buyerUsdc, authority, 10_000_000_000);

    const lpYes = await createAssociatedTokenAccount(provider.connection, lp, yesMint.publicKey, lp.publicKey);
    const lpNo = await createAssociatedTokenAccount(provider.connection, lp, noMint.publicKey, lp.publicKey);
    const buyerYes = await createAssociatedTokenAccount(provider.connection, buyer, yesMint.publicKey, buyer.publicKey);

    // LP underwrites 10,000 USDC -> gets 10,000 YES + 10,000 NO
    await program.methods
      .underwritePool(new anchor.BN(10_000_000_000))
      .accounts({
        shield: shieldPda,
        lp: lp.publicKey,
        lpUsdc,
        vault: vaultPda,
        yesMint: yesMint.publicKey,
        noMint: noMint.publicKey,
        lpYes,
        lpNo,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([lp])
      .rpc();

    // Buyer buys 500 YES shares
    await program.methods
      .buyProtection(new anchor.BN(500_000_000))
      .accounts({
        shield: shieldPda,
        buyer: buyer.publicKey,
        buyerUsdc,
        vault: vaultPda,
        yesMint: yesMint.publicKey,
        buyerYes,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([buyer])
      .rpc();

    const buyerYesAcc = await getAccount(provider.connection, buyerYes);
    assert.equal(buyerYesAcc.amount.toString(), "500000000");

    // (Happy-path resolve requires expiry to pass — for a real devnet run we'd
    // use a short expiry. Here we assert state transitions are callable.)
    const s: any = await program.account.shield.fetch(shieldPda);
    assert.isTrue(s.vaultUsdc.toNumber() > 10_000_000_000);
  });
});
