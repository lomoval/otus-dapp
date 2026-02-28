import { loadWallet, getProgram, getCounterPDA, getCounterData } from './utils';

async function main() {
  console.log('Чтение данных счётчика...\n');

  try {
    const wallet = loadWallet();
    console.log('Wallet:', wallet.publicKey.toString());

    const program = await getProgram(wallet);
    console.log('Program ID:', program.programId.toString());

    const [counterPDA, bump] = await getCounterPDA(program.programId, wallet.publicKey);
    console.log('Counter PDA:', counterPDA.toString());
    console.log('Bump:', bump);

    const counter = await getCounterData(program, counterPDA);

    if (!counter) {
      console.log('\nСчётчик не найден или не инициализирован!');
      console.log('Сначала выполните: npm run initialize');
      return;
    }

    console.log('\nДанные счётчика:');
    console.log('Значение:', counter.value.toString());
    console.log('Authority:', counter.authority.toString());
    console.log(`Explorer: https://explorer.solana.com/address/${counterPDA.toString()}?cluster=devnet`);
  } catch (error) {
    console.error('\nОшибка:', error);
    throw error;
  }
}

main().catch((error) => {
  process.exit(1);
});
