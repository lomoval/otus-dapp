import { loadWallet, getProgram, getCounterPDA, getCounterData } from './utils';

async function main() {
  console.log('Сброс счётчика...\n');

  try {
    const wallet = loadWallet();
    console.log('Wallet:', wallet.publicKey.toString());

    const program = await getProgram(wallet);
    console.log('Program ID:', program.programId.toString());

    const [counterPDA] = await getCounterPDA(program.programId, wallet.publicKey);
    console.log('Counter PDA:', counterPDA.toString());

    const beforeCounter = await getCounterData(program, counterPDA);
    if (!beforeCounter) {
      console.log('\nСчётчик не инициализирован!');
      console.log('Сначала выполните: npm run initialize');
      return;
    }

    console.log('Текущее значение:', beforeCounter.value.toString());

    console.log('\nОтправка транзакции...');
    const tx = await program.methods
      .reset()
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();

    console.log('Счётчик успешно сброшен!');
    console.log('Transaction:', tx);
    console.log('Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    const afterCounter = await getCounterData(program, counterPDA);
    if (afterCounter) {
      console.log('\nНовое значение:', afterCounter.value.toString());
    }
  } catch (error) {
    console.error('\nОшибка:', error);
    throw error;
  }
}

main().catch((error) => {
  process.exit(1);
});
