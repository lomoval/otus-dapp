import TonWeb from "tonweb";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const tonweb = new TonWeb(
        new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC")
    );

    try {
        console.log("Подключение к TON Testnet...");

        const mcInfo = await tonweb.provider.getMasterchainInfo();
        const lastBlock = mcInfo.last;
        const lastBlockHeader = await tonweb.provider.getBlockHeader(
            lastBlock.workchain,
            lastBlock.shard,
            lastBlock.seqno
        );

        console.log("\nИнформация о сети TON:");
        console.log(`Время сети (UNIX): ${lastBlockHeader.gen_utime}`);
        console.log(`Время сети (читаемое): ${new Date(lastBlockHeader.gen_utime * 1000).toLocaleString('ru-RU')}`);
        console.log(`Последний блок: #${lastBlock.seqno}`);
        console.log(`Workchain: ${lastBlock.workchain}`);
        console.log(`Shard: ${lastBlock.shard}`);
        console.log(`Версия: ${lastBlockHeader.version}`);

        const blocksCount = 3;
        console.log(`\nПоследние ${blocksCount} блока:`);

        await sleep(1000); // Чтобы не превышать rate-limit
        for (let i = 0; i < blocksCount; i++) {
            await sleep(1000); // Чтобы не превышать rate-limit
            const seqno = lastBlock.seqno - i;

            try {
                const blockHeader = await tonweb.provider.getBlockHeader(
                    lastBlock.workchain,
                    lastBlock.shard,
                    seqno
                );
                console.log(`\nБлок #${seqno}:`);
                console.log(`   Время: ${new Date(blockHeader.gen_utime * 1000).toLocaleString('ru-RU')}`);
                console.log(`   Хеш: ${blockHeader.id.root_hash}`);

                if (blockHeader.after_merge) {
                    console.log(`   После объединения: да`);
                }
                if (blockHeader.after_split) {
                    console.log(`   После разделения: да`);
                }
            } catch (blockError) {
                console.log(`   Ошибка получения блока #${seqno}:`, blockError.message);
            }
        }
    } catch (error) {
        console.error("❌ Ошибка при работе с TON сетью:");
        console.error(error);
    }
}

main();