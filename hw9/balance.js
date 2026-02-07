import TonWeb from "tonweb";
import config from "./config.js";

const tonweb = new TonWeb(
    new TonWeb.HttpProvider(config.RPC_URL)
);

async function getBalance(address) {
    const info = await tonweb.provider.getAddressInfo(address);
    const nanotons = BigInt(info.balance);
    const tons = Number(nanotons) / 1e9;

    console.log(`Аккаунт ${address}`);
    console.log(`Статус: ${info.state}`);
    console.log(`Баланс: ${tons} TON\n`);
}

const accountNumber = process.argv[2];

async function start() {
    if (!accountNumber || (accountNumber !== "1" && accountNumber !== "2")) {
        await getBalance(config.ACCOUNT_ID1);
        await getBalance(config.ACCOUNT_ID2);
    } else {
        const address =
            accountNumber === "2"
                ? config.ACCOUNT_ID2
                : config.ACCOUNT_ID1;

        await getBalance(address);
    }
}

start().catch(error => {
    console.error("Ошибка при получении баланса:");
    console.error(error);
});
