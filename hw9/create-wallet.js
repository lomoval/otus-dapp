import config from './config.js';
import TonWeb from "tonweb";

async function createWallet() {
    const tonweb = new TonWeb(
        new TonWeb.HttpProvider(config.RPC_URL)
    );

    console.log("Создание нового аккаунта TON (Testnet)");

    const keyPair = await TonWeb.utils.nacl.sign.keyPair();

    const publicKey = keyPair.publicKey;
    const secretKey = keyPair.secretKey;

    const WalletClass = tonweb.wallet.all.v4R2;
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: publicKey,
        wc: 0
    });

    const address = await wallet.getAddress();

    console.log("\nИнформация о кошельке:");
    console.log("----------------------");
    console.log("Адрес (raw):", address.toString(false));
    console.log("Адрес (bounceable):", address.toString(true, true, true));
    console.log("Адрес (non-bounceable):", address.toString(true, true, false));

    console.log("\nКлючи:");
    console.log("------------------------------------");
    console.log("Public key (hex):", TonWeb.utils.bytesToHex(publicKey));
    console.log("Secret key (hex):", TonWeb.utils.bytesToHex(secretKey));
}

createWallet().catch(error => {
    console.error("\nОшибка при создании аккаунта:");
    console.error(error);
});
