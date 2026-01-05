import zmq from "zeromq";
import fetch from "node-fetch";

const WATCH_ADDRESS = "tb1q890vq2ekeh4j50la3vkxr9xhy3ew6rypl7a6lc";

const RPC_USER = "testuser";
const RPC_PASSWORD = "testpassword";
const RPC_PORT = 18332;

const ZMQ_TX = "tcp://127.0.0.1:28332";
const RPC_URL = `http://127.0.0.1:${RPC_PORT}`;

// ZMQ subscriber
const sock = new zmq.Subscriber();
sock.connect(ZMQ_TX);
sock.subscribe("rawtx");

console.log(`== Индексатор запущен (ZMQ rawtx) - ${WATCH_ADDRESS} == `);

for await (const [topic, message] of sock) {
    try {
        const rawTxHex = message.toString("hex");
        const tx = await rpcCall("decoderawtransaction", [rawTxHex]);
        const txid = tx.txid;

        for (const vout of tx.vout) {
            const spk = vout.scriptPubKey;
            if (spk.address && spk.address == WATCH_ADDRESS) {
                const amount = vout.value;

                let confirmations = 0;
                try {
                    const txInfo = await rpcCall("gettransaction", [txid]);
                    confirmations = txInfo.confirmations || 0;
                } catch {
                    confirmations = 0;
                }

                console.log("Входящий платёж");
                console.log(`TxID: ${txid}`);
                console.log(`Сумма: ${amount} BTC`);
                console.log(`Подтверждения: ${confirmations}`);
                console.log("----------------------------------------");
            }
        }
    } catch (err) {
        console.error("Ошибка обработки транзакции:", err.message);
    }
}

async function rpcCall(method, params = []) {
    const res = await fetch(RPC_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(`${RPC_USER}:${RPC_PASSWORD}`).toString("base64")
        },
        body: JSON.stringify({
            jsonrpc: "1.0",
            id: "indexer",
            method,
            params
        })
    });

    const data = await res.json();

    if (data.error) throw new Error(data.error.message);

    return data.result;
}
