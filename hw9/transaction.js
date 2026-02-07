import TonWeb from "tonweb";
import config from "./config.js";

const tonweb = new TonWeb(
    new TonWeb.HttpProvider(config.RPC_URL)
);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendTransaction() {
    console.log("Отправка транзакции TON (Testnet)");

    const publicKey = TonWeb.utils.hexToBytes(config.ACCOUNT_PUBLIC_KEY1);
    const secretKey = TonWeb.utils.hexToBytes(config.ACCOUNT_SECRET_KEY1);

    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, {
        publicKey,
        wc: 0
    });

    const fromAddress = await wallet.getAddress();

    console.log("Отправитель:");
    console.log(fromAddress.toString(false, false, false));

    console.log("\nПолучатель:");
    console.log(config.ACCOUNT_ID2);

    const seqno = await wallet.methods.seqno().call();
    console.log("Текущий seqno:", seqno);

    const amount = 0.057;
    const amountNano = TonWeb.utils.toNano(amount.toString());

    console.log(`Сумма перевода: ${amount} TON`);

    const transfer = wallet.methods.transfer({
        secretKey: secretKey,
        toAddress: config.ACCOUNT_ID2,
        amount: amountNano,
        seqno: seqno,
        sendMode: 3,
        payload: null
    });

    await transfer.send();

    console.log("\nТранзакция отправлена успешно");
    console.log("Ожидаем подтверждение...");

    let currentSeqno = seqno;

    while (currentSeqno === seqno) {
        await sleep(3000); // Чтобы не превышать rate-limit
        currentSeqno = await wallet.methods.seqno().call();
    }

    await sleep(1000); // Чтобы не превышать rate-limit
    const txs = await tonweb.provider.getTransactions( config.ACCOUNT_ID1, 1);
    const lastTx = txs[0];

    console.log("\nТранзакция подтверждена");
    console.log("Новый seqno:", currentSeqno);
    console.log(`Отправлено: ${amount} TON`);
    console.log(`Хэш последней транзакции: ${lastTx.transaction_id.hash}`);
    console.log(`Статус: подтверждена`);
}

sendTransaction().catch(error => {
    console.error("\nОшибка при отправке транзакции:");
    console.error(error);
});
