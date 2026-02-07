import config from './config.js';
import TonWeb from "tonweb";

const httpProvider = new TonWeb.HttpProvider(config.RPC_URL);
const tonweb = new TonWeb(httpProvider);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function deployWallet(privateKey) {
    try {
        const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSecretKey(TonWeb.utils.hexToBytes(privateKey));
        const WalletClass = tonweb.wallet.all['v4R2'];
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });

        const walletAddress = await wallet.getAddress();
        console.log('Адрес:', walletAddress.toString(true, true, true));

        await sleep(1000); // Чтобы не превышать rate-limit
        const balance = await tonweb.provider.getBalance(walletAddress.toString());
        console.log('Баланс:', balance);

        if (balance === '0') {
            console.error('0-й балан, пополните перед деплоем.');
            return;
        }

        const seqno = await wallet.methods.seqno().call();
        console.log('Seqno:', seqno);

        if (seqno === null) {
            await sleep(1500); // Чтобы не превышать rate-limit
            const deployResult = await wallet.deploy(keyPair.secretKey).send();
            console.log('Результат деплоя:', deployResult);
        } else {
            console.log('Кошелек уже задеплоин. Seqno:', seqno);
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}

async function start() {
    await deployWallet(config.ACCOUNT_SECRET_KEY1);
    await sleep(1000); // Чтобы не превышать rate-limit
    console.log()
    await deployWallet(config.ACCOUNT_SECRET_KEY2);
}

start()


