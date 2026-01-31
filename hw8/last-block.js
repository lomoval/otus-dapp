import config from './config.js';

async function getLatestBlockInfo() {
    try {
        const statusResponse = await fetch(config.NEAR_RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'status',
                id: 'dontcare',
                params: []
            })
        });

        if (!statusResponse.ok) {
            throw new Error(`HTTP error! status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        const latestBlock = statusData.result;

        console.log('Информация о последнем блоке');

        console.log(`Network ID: ${latestBlock.chain_id}`);
        console.log(`Protocol Version: ${latestBlock.protocol_version}`);
        console.log(`Height (высота): ${latestBlock.sync_info.latest_block_height}`);
        console.log(`Block Hash: ${latestBlock.sync_info.latest_block_hash}`);
        console.log(`Timestamp: ${new Date(latestBlock.sync_info.latest_block_time).toLocaleString('ru-RU')}`);
        console.log(`Epoch: ${latestBlock.sync_info.epoch_id}`);
        console.log(`Next Epoch: ${latestBlock.sync_info.next_epoch_id}`);
        console.log(`Sync Status: ${latestBlock.sync_info.syncing ? 'Синхронизация...' : 'Синхронизировано'}`);
        console.log(`Epoch Start Height: ${latestBlock.sync_info.epoch_start_height}`);

        return latestBlock;

    } catch (error) {
        console.error('Ошибка при получении информации о блоке:', error.message);
    }
}

getLatestBlockInfo()