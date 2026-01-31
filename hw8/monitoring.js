import config from './config.js';

const ACCOUNT_ID = config.NEAR_ACCOUNT_ID1;

async function getLatestBlock() {
    const response = await fetch(config.NEAR_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "any",
            method: "block",
            params: { "finality": "final" }
        })
    });

    const data = await response.json();
    return data.result;
}

async function getBlock(blockHeight) {
    const response = await fetch(config.NEAR_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "dontcare",
            method: "block",
            params: { block_id: blockHeight }
        })
    });

    const data = await response.json();
    return data.result;
}

function getTransactionAmount(transaction) {
    if (transaction.actions) {
        for (const action of transaction.actions) {
            if (action.Transfer) {
                return parseFloat(action.Transfer.deposit) / 1e24;
            }
        }
    }
    return 0;
}

async function getTransactionStatus(txHash) {
    try {
        const response = await fetch(config.NEAR_RPC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: "dontcare",
                method: "tx",
                params: [txHash, ACCOUNT_ID]
            })
        });

        const data = await response.json();
        return data.result;
    } catch (error) {
        return null;
    }
}

async function getChunk(chunkHash) {
    const response = await fetch(config.NEAR_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "dontcare",
            method: "chunk",
            params: { chunk_id: chunkHash }
        })
    });

    const data = await response.json();
    return data.result;
}

async function monitorTransactions() {
    const processedTransactions = new Set();

    const latestBlock = await getLatestBlock();
    let lastCheckedBlock = latestBlock.header.height;

    console.log(`Отслеживание транзакций для ${ACCOUNT_ID}...\n`);

    while (true) {
        try {
            const latestBlock = await getLatestBlock();
            const currentBlockHeight = latestBlock.header.height;

            for (let blockHeight = lastCheckedBlock; blockHeight <= currentBlockHeight; blockHeight++) {
                // console.log(blockHeight, currentBlockHeight, lastCheckedBlock)
                const block = await getBlock(blockHeight);
                if (!block?.chunks) continue;
                for (const chunkInfo of block.chunks) {
                    const chunk = await getChunk(chunkInfo.chunk_hash);
                    if (!chunk?.transactions) continue;

                    for (const tx of chunk.transactions) {
                        const txHash = tx.hash;

                        const signer = tx.signer_id;
                        const receiver = tx.receiver_id;

                        if (
                            (signer === ACCOUNT_ID || receiver === ACCOUNT_ID) &&
                            !processedTransactions.has(txHash)
                        ) {
                            processedTransactions.add(txHash);
                            const amount = getTransactionAmount(tx);
                            const txStatus = await getTransactionStatus(txHash);

                            let status = 'Pending';
                            if (txStatus?.status?.SuccessValue !== undefined) status = 'Success';
                            if (txStatus?.status?.Failure) status = 'Failed';

                            console.log(`Блок: ${blockHeight}`);
                            console.log(`Хэш: ${txHash}`);
                            console.log(`От: ${signer}`);
                            console.log(`Для: ${receiver}`);
                            console.log(`Количество: ${amount} NEAR`);
                            console.log(`Статус: ${status}`);
                            console.log('-'.repeat(40));
                        }
                    }
                }
            }

            lastCheckedBlock = currentBlockHeight + 1;
            await new Promise(r => setTimeout(r, 10000));

        } catch (error) {
            console.error('Ошибка:', error);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

monitorTransactions();