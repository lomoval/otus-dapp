const {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
} = require('@solana/web3.js');

// Адрес отправителя (8bZ549artQdnGXKsQW2uBgxrTYF3Sbr5BTYHuVtav3fB)
const senderPrivateKey = Uint8Array.from([
    200,  48, 110,  87, 254,  52, 169,  26, 237,  58, 104,
    186,  91, 251, 159,  57, 169,  10,  58, 177,  43,  64,
    172, 240, 163,  68, 115, 255, 139,  50,  66,   2, 112,
    219, 209,  74, 178,  83, 148,  56,  26,  23, 102, 114,
    35,  25,   6, 128, 184, 178, 203, 113, 221, 113, 113,
    144, 202, 215, 104, 109, 119, 230, 170,  38
]);

const receiverPublicKey = new PublicKey('4upfe7PQs63Y4YcFN33uGSdfujnnkE2h76vgKeJjHD1t');
const recieverPrivateKey = Uint8Array.from([
    43,  57, 212, 111, 168, 100, 209, 233, 111,  61, 177,
    79,  84,  52, 160, 190, 105, 149, 249, 109,  50, 115,
    116, 209,  74,  17, 150, 198,  28,  24, 175, 215,  58,
    27,  40, 193,  78,   8, 200,  84, 255,  48,   1, 177,
    254,  63, 140,  96, 147, 245,  55,  82,  67, 213,  34,
    102,   5, 190, 110, 143,   8, 243, 133, 227
]);



// Создаем объект для отправителя с приватным ключом
const senderKeypair = Keypair.fromSecretKey(senderPrivateKey);

// Устанавливаем соединение с локальным узлом Solana
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Определим сумму для перевода (например, 1 SOL)
const amount = 0.01 * LAMPORTS_PER_SOL; // 1 SOL = 10^9 Lamports

async function sendTransaction() {
    try {
        // Создаем транзакцию
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: senderKeypair.publicKey,
                toPubkey: receiverPublicKey,
                lamports: amount,
            })
        );

        // Подписываем транзакцию
        const signature = await connection.sendTransaction(transaction, [senderKeypair]);

        // Ожидаем подтверждения транзакции
        await connection.confirmTransaction(signature, 'confirmed');

        console.log('Транзакция подтверждена:', signature);
        console.log(`Переведено ${amount / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
        console.error('Ошибка при отправке транзакции:', error);
    }
}

// Запуск функции отправки транзакции
sendTransaction();
