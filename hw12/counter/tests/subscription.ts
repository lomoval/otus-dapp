import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { Counter } from "../target/types/counter";

describe("Subscription Service", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const owner = provider.wallet as anchor.Wallet;

  const serviceProvider = Keypair.generate();

  const subscriptionAmount = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
  const subscriptionDuration = 30 * 24 * 60 * 60; // 30 дней в секундах

  let subscriptionPDA: PublicKey;
  let subscriptionBump: number;

  before(async () => {
    [subscriptionPDA, subscriptionBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("subscription"),
        owner.publicKey.toBuffer(),
        serviceProvider.publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log("Owner:", owner.publicKey.toBase58());
    console.log("Service Provider:", serviceProvider.publicKey.toBase58());
    console.log("Subscription PDA:", subscriptionPDA.toBase58());
    console.log("Subscription Bump:", subscriptionBump);
  });

  it("1. Создаёт подписку (инициализация PDA)", async () => {
    const tx = await program.methods
      .createSubscription(
        new anchor.BN(subscriptionAmount),
        new anchor.BN(subscriptionDuration)
      )
      .accounts({
        subscription: subscriptionPDA,
        owner: owner.publicKey,
        serviceProvider: serviceProvider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Create subscription tx:", tx);

    const subscriptionAccount = await program.account.subscription.fetch(subscriptionPDA);

    expect(subscriptionAccount.owner.toBase58()).to.equal(owner.publicKey.toBase58());
    expect(subscriptionAccount.serviceProvider.toBase58()).to.equal(serviceProvider.publicKey.toBase58());
    expect(subscriptionAccount.amount.toNumber()).to.equal(subscriptionAmount);
    expect(subscriptionAccount.duration.toNumber()).to.equal(subscriptionDuration);
    expect(subscriptionAccount.isActive).to.be.true;
    expect(subscriptionAccount.bump).to.equal(subscriptionBump);

    console.log("Subscription data:");
    console.log("  - Owner:", subscriptionAccount.owner.toBase58());
    console.log("  - Service Provider:", subscriptionAccount.serviceProvider.toBase58());
    console.log("  - Amount:", subscriptionAccount.amount.toNumber(), "lamports");
    console.log("  - Duration:", subscriptionAccount.duration.toNumber(), "seconds");
    console.log("  - Start Time:", new Date(subscriptionAccount.startTime.toNumber() * 1000).toISOString());
    console.log("  - Is Active:", subscriptionAccount.isActive);
  });

  it("2. Оплачивает подписку через CPI transfer", async () => {
    const providerBalanceBefore = await provider.connection.getBalance(serviceProvider.publicKey);
    console.log("Provider balance before:", providerBalanceBefore, "lamports");

    const tx = await program.methods
      .paySubscription()
      .accounts({
        subscription: subscriptionPDA,
        owner: owner.publicKey,
        serviceProvider: serviceProvider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Pay subscription tx:", tx);

    const providerBalanceAfter = await provider.connection.getBalance(serviceProvider.publicKey);
    console.log("Provider balance after:", providerBalanceAfter, "lamports");

    expect(providerBalanceAfter - providerBalanceBefore).to.equal(subscriptionAmount);
    console.log("CPI Transfer successful! Transferred:", subscriptionAmount, "lamports");

    const subscriptionAccount = await program.account.subscription.fetch(subscriptionPDA);
    expect(subscriptionAccount.isActive).to.be.true;
    console.log("Updated start time:", new Date(subscriptionAccount.startTime.toNumber() * 1000).toISOString());
  });

  it("3. Проверяет корректное хранение данных", async () => {
    const subscriptionAccount = await program.account.subscription.fetch(subscriptionPDA);

    expect(subscriptionAccount.owner.toBase58()).to.equal(owner.publicKey.toBase58());
    expect(subscriptionAccount.serviceProvider.toBase58()).to.equal(serviceProvider.publicKey.toBase58());
    expect(subscriptionAccount.amount.toNumber()).to.equal(subscriptionAmount);
    expect(subscriptionAccount.duration.toNumber()).to.equal(subscriptionDuration);
    expect(subscriptionAccount.isActive).to.be.true;
    expect(subscriptionAccount.bump).to.equal(subscriptionBump);
    expect(subscriptionAccount.startTime.toNumber()).to.be.greaterThan(0);

    console.log("All data fields verified successfully!");
  });

  it("4. Отменяет подписку", async () => {
    const tx = await program.methods
      .cancelSubscription()
      .accounts({
        subscription: subscriptionPDA,
        owner: owner.publicKey,
        serviceProvider: serviceProvider.publicKey,
      })
      .rpc();

    console.log("Cancel subscription tx:", tx);

    const subscriptionAccount = await program.account.subscription.fetch(subscriptionPDA);
    expect(subscriptionAccount.isActive).to.be.false;
    console.log("Subscription cancelled successfully!");
  });

  it("5. Отклоняет оплату отменённой подписки", async () => {
    try {
      await program.methods
        .paySubscription()
        .accounts({
          subscription: subscriptionPDA,
          owner: owner.publicKey,
          serviceProvider: serviceProvider.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      expect.fail("Expected error but transaction succeeded");
    } catch (error: any) {
      expect(error.toString()).to.include("SubscriptionNotActive");
      console.log("Correctly rejected payment for inactive subscription");
    }
  });

  it("6. Закрывает подписку и возвращает rent", async () => {
    const ownerBalanceBefore = await provider.connection.getBalance(owner.publicKey);
    console.log("Owner balance before close:", ownerBalanceBefore, "lamports");

    const subscriptionAccountInfo = await provider.connection.getAccountInfo(subscriptionPDA);
    const rentToReturn = subscriptionAccountInfo!.lamports;
    console.log("Rent to return:", rentToReturn, "lamports");

    const tx = await program.methods
      .closeSubscription()
      .accounts({
        subscription: subscriptionPDA,
        owner: owner.publicKey,
        serviceProvider: serviceProvider.publicKey,
      })
      .rpc();

    console.log("Close subscription tx:", tx);

    const closedAccount = await provider.connection.getAccountInfo(subscriptionPDA);
    expect(closedAccount).to.be.null;
    console.log("Subscription account closed successfully!");

    const ownerBalanceAfter = await provider.connection.getBalance(owner.publicKey);
    console.log("Owner balance after close:", ownerBalanceAfter, "lamports");
    console.log("Balance change:", ownerBalanceAfter - ownerBalanceBefore, "lamports");
  });

  it("7. Позволяет создать новую подписку после close", async () => {
    // Теперь PDA свободен, можно создать новую подписку
    const tx = await program.methods
      .createSubscription(
        new anchor.BN(subscriptionAmount * 2), // Новая цена
        new anchor.BN(subscriptionDuration * 2) // Новая длительность
      )
      .accounts({
        subscription: subscriptionPDA,
        owner: owner.publicKey,
        serviceProvider: serviceProvider.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Re-create subscription tx:", tx);

    // Проверяем новые данные
    const subscriptionAccount = await program.account.subscription.fetch(subscriptionPDA);
    expect(subscriptionAccount.amount.toNumber()).to.equal(subscriptionAmount * 2);
    expect(subscriptionAccount.duration.toNumber()).to.equal(subscriptionDuration * 2);
    expect(subscriptionAccount.isActive).to.be.true;
    console.log("New subscription created successfully with new parameters!");
  });
});
