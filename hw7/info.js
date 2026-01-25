const {
  Connection,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');

const connection = new Connection('http://localhost:8899', 'confirmed');

// Получаем текущий слот
async function getCurrentSlot() {
  const slot = await connection.getSlot();
  console.log('Текущий слот:', slot);
}

// Получаем версию ноды
async function getNodeVersion() {
  const version = await connection.getVersion();
  console.log('Версия ноды:', version);
}

// Получаем информацию о последнем блоке
async function getLastBlockInfo() {
  const slot = await connection.getSlot();
  const block = await connection.getBlock(slot, {
    maxSupportedTransactionVersion: 0
  });

  console.log('Информация о последнем блоке:', block);

  if (block && block.transactions) {
    console.log(`Найдено ${block.transactions.length} транзакций в блоке.`);

    // Логируем информацию о каждой транзакции
    block.transactions.forEach((transaction, index) => {
      const { transaction: txn, meta } = transaction;

      console.log(`\nТранзакция ${index + 1}:`);
      console.log(`  Хэш: ${txn.signatures[0]}`);
      console.log(`  Версия: ${txn.version || 'старый формат'}`); // Выводим версию транзакции (может быть 'старый формат' или другая)

      // Логирование мета-данных транзакции (если они есть)
      if (meta) {
        console.log(`  Статус: ${meta.err ? 'Неудача' : 'Успех'}`);
        console.log(`  Плата: ${meta.fee / LAMPORTS_PER_SOL} SOL`); // Логируем плату за транзакцию в SOL
      }

      // Если в транзакции есть переданные инструкции (например, переводы SOL), можно их тоже логировать
      if (txn.message.instructions && txn.message.instructions.length > 0) {
        txn.message.instructions.forEach((instruction, idx) => {
          console.log(`  Инструкция ${idx + 1}:`);

          // Проверяем, существует ли programId в инструкции перед вызовом toBase58()
          if (instruction.programId) {
            console.log(`    Program ID: ${instruction.programId.toBase58()}`);
          } else {
            console.log(`    Program ID: [Нет Program ID]`);
          }

          // Логируем данные инструкции (если они есть)
          if (instruction.data) {
            console.log(`    Данные: ${Buffer.from(instruction.data).toString('base64')}`);
          } else {
            console.log(`    Данные: [Нет данных]`);
          }
        });
      }
    });
  } else {
    console.log('Транзакции в блоке не найдены.');
  }
}

(async () => {
  await getCurrentSlot();
  await getNodeVersion();
  await getLastBlockInfo();
})();
