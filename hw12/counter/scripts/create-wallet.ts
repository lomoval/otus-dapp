import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🔑 Создание нового Solana wallet...\n');

  const keypair = Keypair.generate();

  const walletPath = path.join(__dirname, '..', 'wallet.json');

  const secretKey = Array.from(keypair.secretKey);
  fs.writeFileSync(walletPath, JSON.stringify(secretKey));

  console.log('Wallet успешно создан!');
  console.log('Путь к файлу:', walletPath);
  console.log('Public key:', keypair.publicKey.toString());
  console.log('\nДля получения тестовых SOL на Devnet выполните:');
  console.log(`   solana airdrop 2 ${keypair.publicKey.toString()} --url devnet`);
  console.log('\nИли используйте веб-фaucet: https://faucet.solana.com/');
}

main().catch((error) => {
  console.error('Ошибка при создании wallet:', error);
  process.exit(1);
});
