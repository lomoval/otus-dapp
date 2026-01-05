// blockstream.js

const BASE_URL = "https://blockstream.info/api";

async function getLastBlockInfo() {
    try {
        // 1. Получаем хэш последнего блока
        const hashResponse = await fetch(`${BASE_URL}/blocks/tip/hash`);
        const lastBlockHash = await hashResponse.text();

        // 2. Получаем информацию о блоке
        const blockResponse = await fetch(`${BASE_URL}/block/${lastBlockHash}`);
        const blockData = await blockResponse.json();

        const height = blockData.height;
        const timestamp = blockData.timestamp;
        const txCount = blockData.tx_count;
        const size = blockData.size;

        // 3. Получаем список транзакций
        const txidsResponse = await fetch(`${BASE_URL}/block/${lastBlockHash}/txids`);
        const txids = await txidsResponse.json();

        // Вывод
        console.log("Последний блок");
        console.log("----------------------------");
        console.log(`Хэш блока: ${lastBlockHash}`);
        console.log(`Высота блока: ${height}`);
        console.log(`Время блока: ${new Date(timestamp * 1000).toUTCString()}`);
        console.log(`Количество транзакций: ${txCount}`);
        console.log(`Размер блока: ${size} байт`);

        console.log("\nСписок транзакций:");
        txids.forEach(txid => console.log(txid));

    } catch (error) {
        console.error("Ошибка при получении данных:", error);
    }
}

getLastBlockInfo();
