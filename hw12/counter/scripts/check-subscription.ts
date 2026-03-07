import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { loadWallet, getProgram } from "./utils";

async function main() {
  const wallet = loadWallet();
  const program = await getProgram(wallet);

  const serviceProviderArg = process.argv[2];

  if (!serviceProviderArg) {
    console.log("Использование: yarn check-subscription <SERVICE_PROVIDER_ADDRESS>");
    console.log("Пример: yarn check-subscription Abc123...");
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

  console.log("=== Проверка статуса подписки ===");
  console.log("Owner:", wallet.publicKey.toBase58());
  console.log("Service Provider:", serviceProviderPubkey.toBase58());
  console.log("Subscription PDA:", subscriptionPDA.toBase58());
  console.log("");

  try {
    const subscription = await program.account.subscription.fetch(subscriptionPDA);

    console.log("=== Данные подписки ===");
    console.log("Owner:", subscription.owner.toBase58());
    console.log("Service Provider:", subscription.serviceProvider.toBase58());
    console.log("Amount:", subscription.amount.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("Duration:", subscription.duration.toNumber() / (24 * 60 * 60), "days");

    const startTime = new Date(subscription.startTime.toNumber() * 1000);
    const endTime = new Date(startTime.getTime() + subscription.duration.toNumber() * 1000);
    const now = new Date();

    console.log("Start Time:", startTime.toISOString());
    console.log("End Time:", endTime.toISOString());
    console.log("Is Active:", subscription.isActive);
    console.log("Bump:", subscription.bump);

    // Проверяем, истекла ли подписка
    if (subscription.isActive) {
      if (now < endTime) {
        const remainingMs = endTime.getTime() - now.getTime();
        const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
        const remainingHours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        console.log("\nСтатус: АКТИВНА");
        console.log(`Осталось: ${remainingDays} дней ${remainingHours} часов`);
      } else {
        console.log("\nСтатус: ИСТЕКЛА (требуется продление)");
      }
    } else {
      console.log("\nСтатус: ОТМЕНЕНА");
    }
  } catch (error: any) {
    if (error.message.includes("Account does not exist")) {
      console.log("Подписка не найдена. Создайте её с помощью:");
      console.log("  yarn create-subscription", serviceProviderPubkey.toBase58());
    } else {
      console.error("Ошибка:", error.message);
    }
  }
}

main();
