import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { loadWallet, getProgram } from "./utils";

async function main() {
  const wallet = loadWallet();
  const program = await getProgram(wallet);

  const serviceProviderArg = process.argv[2];

  if (!serviceProviderArg) {
    console.log("Использование: yarn close-subscription <SERVICE_PROVIDER_ADDRESS>");
    console.log("Пример: yarn close-subscription Abc123...");
    process.exit(1);
  }

  const serviceProviderPubkey = new PublicKey(serviceProviderArg);

  const [subscriptionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("subscription"),
      wallet.publicKey.toBuffer(),
      serviceProviderPubkey.toBuffer(),
    ],
    program.programId
  );

  console.log("=== Закрытие подписки ===");
  console.log("Owner:", wallet.publicKey.toBase58());
  console.log("Service Provider:", serviceProviderPubkey.toBase58());
  console.log("Subscription PDA:", subscriptionPDA.toBase58());
  console.log("");

  try {
    const connection = program.provider.connection;

    // Получаем баланс owner до закрытия
    const ownerBalanceBefore = await connection.getBalance(wallet.publicKey);
    console.log("Баланс owner до:", ownerBalanceBefore / LAMPORTS_PER_SOL, "SOL");

    // Получаем rent аккаунта подписки
    const subscriptionAccountInfo = await connection.getAccountInfo(subscriptionPDA);
    if (!subscriptionAccountInfo) {
      console.error("Ошибка: Подписка не найдена!");
      process.exit(1);
    }
    const rentToReturn = subscriptionAccountInfo.lamports;
    console.log("Rent к возврату:", rentToReturn / LAMPORTS_PER_SOL, "SOL");

    // Закрываем подписку
    const tx = await program.methods
      .closeSubscription()
      .accountsPartial({
        owner: wallet.publicKey,
        serviceProvider: serviceProviderPubkey,
      })
      .rpc();

    console.log("\nПодписка закрыта!");
    console.log("TX Hash:", tx);
    console.log(`Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    // Проверяем баланс после закрытия
    const ownerBalanceAfter = await connection.getBalance(wallet.publicKey);
    console.log("\nБаланс owner после:", ownerBalanceAfter / LAMPORTS_PER_SOL, "SOL");
    console.log("Возвращено (примерно):", (ownerBalanceAfter - ownerBalanceBefore) / LAMPORTS_PER_SOL, "SOL");
    console.log("(минус комиссия за транзакцию)");

    // Проверяем что PDA теперь пустой
    const pdaAfter = await connection.getAccountInfo(subscriptionPDA);
    if (pdaAfter === null) {
      console.log("\nPDA освобождён - можно создать новую подписку!");
    }
  } catch (error: any) {
    console.error("Ошибка:", error.message);
    if (error.logs) {
      console.error("Logs:", error.logs);
    }
  }
}

main();
