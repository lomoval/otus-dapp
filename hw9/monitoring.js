import TonWeb from "tonweb";
import config from "./config.js";

const tonweb = new TonWeb(new TonWeb.HttpProvider(config.RPC_URL));

const seenTx = new Set();

function formatTon(amountNano) {
    return Number(amountNano)/ 1e9 ;
}

function explorerLink(txHash) {
    return `${config.EXPLORER_URL}/tx/${txHash}`;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getTransactions(address, limit) {
    return await tonweb.provider.getTransactions(address, limit);
}

async function monitor() {

    const txs = await getTransactions(config.ACCOUNT_ID2, 100);
    for (const tx of txs) {
        const hash = tx.transaction_id.hash;
        if (seenTx.has(hash)) continue;
        seenTx.add(hash);
    }

    console.log("Мониторинга входящих транзакций...");
    console.log("Адрес:", config.ACCOUNT_ID2);

    while (true) {
        try {

            const txs = await getTransactions(config.ACCOUNT_ID2, 100);
            for (const tx of txs) {
                const hash = tx.transaction_id.hash;
                if (seenTx.has(hash)) continue;
                seenTx.add(hash);

                const isIncoming = tx.in_msg?.source !== null && tx.in_msg?.source !== undefined;

                const amount = tx.in_msg?.value || "0";

                if (isIncoming) {
                    console.log("Новая входящая транзакция:");
                    console.log("Hash:", hash);
                    console.log("Lt:", tx.transaction_id.lt);
                    console.log("Сумма:", formatTon(amount), "TON");
                    console.log("Ссылка:", explorerLink(hash));
                    console.log()
                }
            }
            await sleep(5000)
        } catch (e) {
            console.error("Ошибка при запросе транзакций:", e.message || e);
        }

        await new Promise(r => setTimeout(r, config.POLL_INTERVAL));
    }
}

monitor().catch(console.error);
