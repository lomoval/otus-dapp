const { Web3 } = require('web3');

const web3 = new Web3('http://127.0.0.1:8545');

async function main() {
    try {
        const blockNumber = await web3.eth.getBlockNumber();
        const peerCount = await web3.eth.net.getPeerCount();
        const syncing = await web3.eth.isSyncing();
        const gasPrice = await web3.eth.getGasPrice();

        console.log('=== Общая информация ===');
        console.log('Текущий номер блока:', blockNumber);
        console.log('Количество пиров:', peerCount);
        if (syncing) {
                console.log(`Статус синхронизации: ${syncing.currentBlock}/${syncing.highestBlock}`);
                console.log('Данные синхронизации: ', syncing);
        } else {
                console.log('Статус синхронизации: узел синхронизирован')
        }
        console.log('Текущая цена газа (wei):', gasPrice);
        console.log('Текущая цена газа (gwei):', web3.utils.fromWei(gasPrice, 'gwei'));
        console.log('');

        const block = await web3.eth.getBlock(blockNumber, true);

        console.log('=== Последний блок ===');
        console.log('Хэш блока:', block.hash);
        console.log('Временная метка:', new Date(Number(block.timestamp) * 1000).toISOString());
        console.log('Количество транзакций:', block.transactions.length);
        console.log('');

        if (block.transactions.length == 0) {
                return;        
        }

        console.log('=== 3 транзакции из блока ===');

        const txs = block.transactions.slice(0, 3);

        txs.forEach((tx, index) => {
            console.log(`\nТранзакция ${index + 1}:`);
            console.log('Хэш:', tx.hash);
            console.log('Отправитель:', tx.from);
            console.log('Получатель:', tx.to ? tx.to : 'контракт (to = null)');
            console.log(
                'Сумма перевода (ETH):',
                web3.utils.fromWei(tx.value, 'ether')
            );
        });

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

main();
