import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { loadWallet, getProgram } from "./utils";

async function main() {
  const wallet = loadWallet();
  const program = await getProgram(wallet);

  // Параметры подписки
  const amount = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL
  const duration = 30 * 24 * 60 * 60; // 30 дней в секундах

  const serviceProviderArg = process.argv[2];
  let serviceProviderPubkey: PublicKey;

  if (serviceProviderArg) {
    serviceProviderPubkey = new PublicKey(serviceProviderArg);
  } else {
    serviceProviderPubkey = new PublicKey("11111111111111111111111111111111");
    console.log("Используется тестовый адрес провайдера. Для указания реального:");
    console.log("  yarn create-subscription <SERVICE_PROVIDER_ADDRESS>\n");
  }

  // Вычисляем PDA для подписки
  const [subscriptionPDA, subscriptionBump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("subscription"),
      wallet.publicKey.toBuffer(),
      serviceProviderPubkey.toBuffer(),
    ],
    program.programId
  );

  console.log("=== Создание подписки ===");
  console.log("Owner:", wallet.publicKey.toBase58());
  console.log("Service Provider:", serviceProviderPubkey.toBase58());
  console.log("Subscription PDA:", subscriptionPDA.toBase58());
  console.log("Amount:", amount / LAMPORTS_PER_SOL, "SOL");
  console.log("Duration:", duration / (24 * 60 * 60), "days");
  console.log("");

  try {
    const tx = await program.methods
      .createSubscription(
        new anchor.BN(amount),
        new anchor.BN(duration)
      )
      .accountsPartial({
        owner: wallet.publicKey,
        serviceProvider: serviceProviderPubkey,
      })
      .rpc();

    console.log("Транзакция успешна!");
    console.log("TX Hash:", tx);
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    const subscriptionAccount = await program.account.subscription.fetch(subscriptionPDA);
    console.log("\n=== Данные подписки ===");
    console.log("Owner:", subscriptionAccount.owner.toBase58());
    console.log("Service Provider:", subscriptionAccount.serviceProvider.toBase58());
    console.log("Amount:", subscriptionAccount.amount.toNumber(), "lamports");
    console.log("Duration:", subscriptionAccount.duration.toNumber(), "seconds");
    console.log("Start Time:", new Date(subscriptionAccount.startTime.toNumber() * 1000).toISOString());
    console.log("Is Active:", subscriptionAccount.isActive);
    console.log("Bump:", subscriptionAccount.bump);
  } catch (error: any) {
    console.error("Ошибка:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
  }
}

main();
