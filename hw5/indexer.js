const BASE_URL = "https://blockstream.info/testnet/api";

// bitcoin:TB1Q890VQ2EKEH4J50LA3VKXR9XHY3EW6RYPL7A6LC
// tb1q890vq2ekeh4j50la3vkxr9xhy3ew6rypl7a6lc
const WATCH_ADDRESS = "tb1q890vq2ekeh4j50la3vkxr9xhy3ew6rypl7a6lc"; // testnet

async function getTipHeight() {
    const res = await fetch(`${BASE_URL}/blocks/tip/height`);
    return parseInt(await res.text(), 10);
}

async function getAddressTxs(address) {
    const res = await fetch(`${BASE_URL}/address/${address}/txs`);
    return await res.json();
}

async function run() {
    console.log("== Проверка входящих платежей (testnet) ==");
    console.log(`Адрес: ${WATCH_ADDRESS}\n`);

    const tipHeight = await getTipHeight();
    const txs = await getAddressTxs(WATCH_ADDRESS);

    if (txs.length === 0) {
        console.log("Транзакции не найдены.");
        return;
    }

    for (const tx of txs) {
        let incomingAmount = 0;
        for (const vout of tx.vout) {
            if (
                vout.scriptpubkey_address === WATCH_ADDRESS
            ) {
                incomingAmount += vout.value;
            }
        }

        // если входящий платёж есть
        if (incomingAmount > 0) {
            let confirmations = 0;

            if (tx.status.confirmed) {
                confirmations = tipHeight - tx.status.block_height + 1;
            }

            console.log("== Входящий платёж ==");
            console.log(`TxID: ${tx.txid}`);
            console.log(`Сумма: ${(incomingAmount / 1e8).toFixed(8)} BTC`);
            console.log(`Подтверждения: ${confirmations}`);
            console.log("-".repeat(40));
        }
    }
}

run().catch(console.error);
