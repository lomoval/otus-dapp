import config from './config.js';

async function getBalance(accountId) {
    const response = await fetch(config.NEAR_RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: "any",
            method: "query",
            params: {
                request_type: "view_account",
                finality: "final",
                account_id: accountId
            }
        })
    });

    const data = await response.json();
    const balance = data.result.amount / 1e24;
    console.log(`Баланс ${accountId}:\t`, balance, "NEAR");
}

const accountNumber = process.argv[2];

async function start() {
    if (!accountNumber || (accountNumber !== '1' && accountNumber !== '2')) {
        await getBalance(config.NEAR_ACCOUNT_ID1);
        await getBalance(config.NEAR_ACCOUNT_ID2);
    } else {
        const accountId = accountNumber === '2' ? config.NEAR_ACCOUNT_ID2 : config.NEAR_ACCOUNT_ID1;
        await getBalance(accountId);
    }
}

start()