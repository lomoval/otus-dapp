import { loadWallet, getProgram, getCounterPDA, getCounterData } from './utils';

async function main() {
  console.log('Инициализация счётчика...\n');

  try {
    const wallet = loadWallet();
    console.log('Wallet:', wallet.publicKey.toString());

    const program = await getProgram(wallet);
    console.log('Program ID:', program.programId.toString());

    const [counterPDA, bump] = await getCounterPDA(program.programId, wallet.publicKey);
    console.log('Counter PDA:', counterPDA.toString());
    console.log('Bump:', bump);

    const existingCounter = await getCounterData(program, counterPDA);
    if (existingCounter) {
      console.log('\n  Счётчик уже инициализирован!');
      console.log(' Текущее значение:', existingCounter.value.toString());
      console.log(' Authority:', existingCounter.authority.toString());
      return;
    }

    console.log('\n Отправка транзакции...');
    const tx = await program.methods
      .initialize()
      .accounts({
        user: wallet.publicKey,
      })
      .rpc();

    console.log(' Счётчик успешно инициализирован!');
    console.log(' Transaction:', tx);
    console.log(' Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    const counter = await getCounterData(program, counterPDA);
    if (counter) {
      console.log('\n Данные счётчика:');
      console.log('   Значение:', counter.value.toString());
      console.log('   Authority:', counter.authority.toString());
    }
  } catch (error) {
    console.error('\n Ошибка:', error);
    throw error;
  }
}

main().catch((error) => {
  process.exit(1);
});
