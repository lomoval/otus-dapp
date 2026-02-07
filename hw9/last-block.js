import config from './config.js';
import TonWeb from "tonweb";

async function checkNetworkStatus() {
    const tonweb = new TonWeb(
        new TonWeb.HttpProvider(config.RPC_URL)
    );

    const mcInfo = await tonweb.provider.getMasterchainInfo();
    const lastBlock = mcInfo.last;

    console.log("\nСтатус мастерчейна:");
    console.log(`Workchain: ${lastBlock.workchain}`);
    console.log(`Shard: ${lastBlock.shard}`);
    console.log(`Seqno (номер блока): ${lastBlock.seqno}`);
    console.log(`Root hash: ${lastBlock.root_hash}`);
    console.log(`File hash: ${lastBlock.file_hash}`);
}

// Запуск скрипта
checkNetworkStatus().catch(error => {
    console.error("\nОшибка при проверке статуса сети:");
    console.error(error);
});
