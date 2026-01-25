const {
    Connection,
    Keypair,
    clusterApiUrl,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram
} = require('@solana/web3.js');

const connection = new Connection('http://localhost:8899', 'confirmed');

async function createKeypair() {
    const keypair = Keypair.generate();
    console.log('Создана новая ключевая пара:', keypair.publicKey.toBase58(), 'Приватный ключ', keypair.secretKey);
    return keypair;
}

async function requestAirdrop(publicKey) {
    const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
    console.log('Запрос на airdrop отправлен. Подпись:', signature);

    // Ожидаем подтверждения транзакции с новой стратегией
    const confirmationStrategy = {
        commitment: 'confirmed',  // Можем использовать 'confirmed', 'processed' или 'finalized'
        preflightCommitment: 'processed'  // Какой коммитмент использовать для предварительного подтверждения
    };

    // Подтверждаем транзакцию с новой стратегией
    const result = await connection.confirmTransaction(signature, confirmationStrategy);
}

async function checkBalance(publicKey) {
    const balance = await connection.getBalance(publicKey);
    console.log(`Баланс ${publicKey.toBase58()}: ${balance / LAMPORTS_PER_SOL} SOL`);
}

async function sendTransaction(fromKeypair, toPublicKey, amount) {
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toPublicKey,
            lamports: amount * LAMPORTS_PER_SOL,
        })
    );

    const signature = await connection.sendTransaction(transaction, [fromKeypair]);
    console.log('Транзакция отправлена. Подпись:', signature);
    const confirmation = await connection.confirmTransaction(signature);
    console.log(`Транзакция подтверждена (${fromKeypair.publicKey.toBase58()} -> ${toPublicKey}}) : `, confirmation);
}

(async () => {
    const keypair = await createKeypair();
    await requestAirdrop(keypair.publicKey);
    await checkBalance(keypair.publicKey);

    const recipientKeypair = await createKeypair();
    await sendTransaction(keypair, recipientKeypair.publicKey, 1);
    await checkBalance(keypair.publicKey);
    await checkBalance(recipientKeypair.publicKey);
})();
