const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const publicKey = new PublicKey("4upfe7PQs63Y4YcFN33uGSdfujnnkE2h76vgKeJjHD1t");

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function monitorTransactions() {
    console.log('Мониторинг входящих транзакций для:', publicKey.toString());

    connection.onLogs(publicKey, async (logs, context) => {
        const res = await getReceiveTxDetails(logs.signature);
        if (res) {
            console.log(`Информация о транзакции:`);
            console.log(`  Хэш транзакции: ${res.hash}`);
            console.log(`  Номер слота: ${res.slot}`);
            console.log(`  Сумма перевода: ${res.amountSOL} SOL`);
            console.log(`  Ссылка на транзакцию в Solana Explorer: https://explorer.solana.com/tx/${res.hash}?cluster=devnet`);

        }
    }, 'confirmed');
}


async function getReceiveTxDetails(signature) {
    const tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
    });

    if (!tx) return;

    const accountKeys = tx.transaction.message.accountKeys;
    const accountIndex = accountKeys.findIndex((key) => key.pubkey.toString() === publicKey.toString());
    if (accountIndex === -1) {
        return;
    }

    let isReceived = false;
    tx.transaction.message.instructions.forEach((instruction) => {
        if (instruction.parsed && instruction.parsed.type === "transfer") {
            const destination = instruction.parsed.info.destination;
            if (destination === publicKey.toString()) {
                isReceived = true
            }
        }
    });

    if (!isReceived) {
        return;
    }

    const slot = tx.slot;
    const hash = tx.transaction.signatures[0];
    const pre = tx.meta.preBalances[accountIndex];
    const post = tx.meta.postBalances[accountIndex];
    const amountSOL = (post - pre) / LAMPORTS_PER_SOL;
    return {hash, slot, amountSOL, explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`};
}


// Запуск мониторинга транзакций
monitorTransactions().catch((error) => console.error("Error during transaction monitoring:", error));
