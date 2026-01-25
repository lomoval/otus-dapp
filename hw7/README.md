# HW7 - Запуск узла Solana и базовое взаимодействие с сетью

## Установка компонентов на Mac

**Solana**:

```
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

Включение devnet:
```
solana config set --url devnet
```

Включение локального узла: 
```
solana-test-validator --limit-ledger-size
```

## Зупуск скриптов

Установка зависимостей:
```
npm install
```

### Информация о сети (локальный валидатор)
```
node info.js
```
```
Текущий слот: 11168
Версия ноды: { 'feature-set': 3604001754, 'solana-core': '3.0.13' }
Информация о последнем блоке: {
  blockHeight: 11168,
  blockTime: 1769353827,
  blockhash: '2mct4eRCE5mWBgV1o1ewBBFDho9wDmo8YheEPCkgF37K',
  parentSlot: 11167,
  previousBlockhash: '591cybiMm9VLycqAvjfA2qd4DFsfqo52MPrpDZi9bPr8',
  rewards: [
    {
      commission: null,
      lamports: 5000,
      postBalance: 499944175000,
      pubkey: 'J3shAFPati1nokAb4oBxbBUQjj5L1WYJoKN5A74nc7LH',
      rewardType: 'Fee'
    }
  ],
  transactions: [ { meta: [Object], transaction: [Object], version: 'legacy' } ]
}
Найдено 1 транзакций в блоке.

Транзакция 1:
  Хэш: 63g71ucMCSQwYo6LhfyGVKQFhJ9SCRmmTXvcbaaXm7b1ntEZZZvXiCN7BqCHDCUvVqNF62THC8ireRaD5M97wqx3
  Версия: старый формат
  Статус: Успех
  Плата: 0.00001 SOL
  Инструкция 1:
    Program ID: [Нет Program ID]
    Данные: NjdNR243SmJBVHJLUVJBd20zeVo0Q0dHQWpMZnhLR044YzVwblR5ZzhCNGdRSHdnSG02ZXlxdUhidnQ2Y1UxcDI4UFlDcjZEcmFmOENmZ0FaVU1ab3NaUXhzeHNEVkFuVGJkYjU0RWhKeXFlc3RnV1lSZHdoeW90aVF5ZWdiZEZERlBFaXVKR3lxRjJicHhiMmE3cmk2ZHZvUkQyREc1SnFBZG9UbVBCVE5LU1FmcldlZWhDYjJRUFJGc3FYODQ3VEYzS01ZUUR1MQ==
lomov@Aleksandrs-
```

### Создание аккаунтов, airdrop, транзакция (локальный валидатор) 

```
node accounts.js
```

```
Создана новая ключевая пара: DTRmef9uR8pdB6Wap2HpJ4zsgWBVDxq3msa6dKKAEZAb Приватный ключ Uint8Array(64) [
    9, 170,  67,  44,  73,  61, 121, 144,  58,  49,  35,
  133,  59,  56, 130,  11, 212,  64,  46,  11, 133, 210,
  164, 133, 147,  60, 189,  14,  50, 186, 129,  49, 185,
   17,  89, 250,   6, 160, 251,  18, 248, 245, 124, 229,
  220, 154,   9, 254, 184,  91, 236, 241, 171, 136, 228,
    8, 210,   9, 231, 133, 213, 186, 135,   4
]
Запрос на airdrop отправлен. Подпись: 4rKhyVMbSAN8Vf2MK9Rui7RuiJKiqMTGMgBx8ZmUoXT6oXwfckFU3RqEXXvD294gqP8D5eZoXgE28VJmCCtHFF8j
Баланс DTRmef9uR8pdB6Wap2HpJ4zsgWBVDxq3msa6dKKAEZAb: 2 SOL
Создана новая ключевая пара: 5QyksrFGVR99Evi5S45PbxCrHnKb6YQTEPMMMqx2ewL8 Приватный ключ Uint8Array(64) [
   33,  82,  90,   0, 226, 119,  39, 195, 174,   5,  11,
  231, 126, 237,  41,   1, 249, 158, 189,  27, 189,  75,
  146,  11, 121, 170, 210,  41, 188,  72, 142, 148,  65,
  147,  71, 245,  91,  41, 185, 244, 246,  19,   4,  26,
   93, 247, 207, 184,  81, 214,  82, 231,  67, 218, 143,
  252, 152,  81,  18, 213,  64,  11,  30,  37
]
Транзакция отправлена. Подпись: 3AJNq8M88pPeMqBnqBmgWX7Skp8sFNS2j3HzGbRu29Q2VDZqxMDPczuQYy48AX1pCB5AR6ptHP4CG96hSk75VnAC
Транзакция подтверждена (DTRmef9uR8pdB6Wap2HpJ4zsgWBVDxq3msa6dKKAEZAb -> 5QyksrFGVR99Evi5S45PbxCrHnKb6YQTEPMMMqx2ewL8}) :  { context: { slot: 12592 }, value: { err: null } }
Баланс DTRmef9uR8pdB6Wap2HpJ4zsgWBVDxq3msa6dKKAEZAb: 0.999995 SOL
Баланс 5QyksrFGVR99Evi5S45PbxCrHnKb6YQTEPMMMqx2ewL8: 1 SOL
```


**Мониторинг (devnet)**

Запустить мониторинг:
```
node monitoring.js 
```

```
Мониторинг входящих транзакций для: 4upfe7PQs63Y4YcFN33uGSdfujnnkE2h76vgKeJjHD1t
```

Создать транзакцию:
```
node maketransaction.js
```
Скрипт переводит 0.01 SOL с 8bZ549artQdnGXKsQW2uBgxrTYF3Sbr5BTYHuVtav3fB на 4upfe7PQs63Y4YcFN33uGSdfujnnkE2h76vgKeJjHD1t.
```
Транзакция подтверждена: 3zzLNSu7NxaFUBUqDcJ9XnduwLAhEKMjtjKDfDwst9gdYykJzmSRmmhPhgdDfW6N46XWNSAqXWMJXqnk6VWPTvaC
Переведено 0.01 SOL
```

Мониторинг получит транзакцию:
```
Информация о транзакции:
  Хэш транзакции: 3zzLNSu7NxaFUBUqDcJ9XnduwLAhEKMjtjKDfDwst9gdYykJzmSRmmhPhgdDfW6N46XWNSAqXWMJXqnk6VWPTvaC
  Номер слота: 437584187
  Сумма перевода: 0.01 SOL
  Ссылка на транзакцию в Solana Explorer: https://explorer.solana.com/tx/3zzLNSu7NxaFUBUqDcJ9XnduwLAhEKMjtjKDfDwst9gdYykJzmSRmmhPhgdDfW6N46XWNSAqXWMJXqnk6VWPTvaC?cluster=devnet
```
