import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { loadWallet, getProgram } from "./utils";

async function main() {
  const wallet = loadWallet();
  const program = await getProgram(wallet);

  const serviceProviderArg = process.argv[2];

  if (!serviceProviderArg) {
    console.log("Использование: yarn pay-subscription <SERVICE_PROVIDER_ADDRESS>");
    console.log("Пример: yarn pay-subscription Abc123...");
    process.exit(1);
  }

  const serviceProviderPubkey = new PublicKey(serviceProviderArg);

  // Вычисляем PDA для подписки
  const [subscriptionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("subscription"),
      wallet.publicKey.toBuffer(),
      serviceProviderPubkey.toBuffer(),
    ],
    program.programId
  );

  console.log("=== Оплата подписки (CPI Transfer) ===");
  console.log("Owner:", wallet.publicKey.toBase58());
  console.log("Service Provider:", serviceProviderPubkey.toBase58());
  console.log("Subscription PDA:", subscriptionPDA.toBase58());
  console.log("");

  try {
    // Проверяем существование подписки
    const subscriptionBefore = await program.account.subscription.fetch(subscriptionPDA);
    console.log("Сумма к оплате:", subscriptionBefore.amount.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("Подписка активна:", subscriptionBefore.isActive);

    if (!subscriptionBefore.isActive) {
      console.error("Ошибка: Подписка не активна!");
      process.exit(1);
    }

    // Получаем баланс провайдера до оплаты
    const connection = program.provider.connection;
    const providerBalanceBefore = await connection.getBalance(serviceProviderPubkey);
    console.log("\nБаланс провайдера до:", providerBalanceBefore / LAMPORTS_PER_SOL, "SOL");

    // Выполняем оплату
    const tx = await program.methods
      .paySubscription()
      .accountsPartial({
        owner: wallet.publicKey,
        serviceProvider: serviceProviderPubkey,
      })
      .rpc();

    console.log("\nТранзакция успешна!");
    console.log("TX Hash:", tx);
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // Проверяем баланс после оплаты
    const providerBalanceAfter = await connection.getBalance(serviceProviderPubkey);
    console.log("\nБаланс провайдера после:", providerBalanceAfter / LAMPORTS_PER_SOL, "SOL");
    console.log("Переведено:", (providerBalanceAfter - providerBalanceBefore) / LAMPORTS_PER_SOL, "SOL");

    // Читаем обновлённые данные подписки
    const subscriptionAfter = await program.account.subscription.fetch(subscriptionPDA);
    console.log("\nОбновлённое время начала:", new Date(subscriptionAfter.startTime.toNumber() * 1000).toISOString());
  } catch (error: any) {
    console.error("Ошибка:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
  }
}

main();
