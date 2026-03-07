# HW12 - Смарт-контракт на Rust и деплоим в Solana (Часть 2, Уровень 1)

Добавлена реализация подписки: `programs/counter/src/subscription_impl.rs`  
Скрипты для подписки: 
 - `scripts/create-subscription.ts`
 - `scripts/pay-subscription.ts`
 - `scripts/check-subscription.ts`
 - `scripts/close-subscription.ts`.

### Сборка проекта

В папке counter

```
anchor build
```

Пополняем баланс и деплоим
```
anchor deploy
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: ./wallet.json
Deploying program "counter"...
Program path: /Users/lomov/Seafile/Work/projects/otus/otus-dapp/hw12/counter/target/deploy/counter.so...
Program Id: E4h5ZWMi7jUgSucoXRMi4LBM7mivWHqFQEbj6sTMiiZm

Signature: 3jetqhJV2coEwMAQYeaqkqgGd8imb7YdNGL6RD9BdQXYk6moGPdyn2Xcw6ZM3XzqvK7HisQNwhf4f4mYAoZyfBYj

Waiting for program E4h5ZWMi7jUgSucoXRMi4LBM7mivWHqFQEbj6sTMiiZm to be confirmed...
Program confirmed on-chain
Idl data length: 1051 bytes
Step 0/1051 
Step 600/1051 
Idl account BmADehW91NpaNKHo8Kfwd6u6cVqQxc5ktmAaVCBXSfyB successfully upgraded
Deploy success
```
Меняем ID на полученный (Anchor.toml, lib.rs) `E4h5ZWMi7jUgSucoXRMi4LBM7mivWHqFQEbj6sTMiiZm`
Пересобираеем и деплоим с новым ID.

## Запуск тестов

```
anchor test
```
```
 ✔ 1. Создаёт подписку (инициализация PDA) (970ms)
Provider balance before: 0 lamports
Pay subscription tx: vYiGysSKcFFTFQWBrHgUR8kGU9RJaDcMxkKFeHeb9n1BkMGkAoNW98nPKRfzuxuYfVWmzJeh1W1KbyfCpHU6jZo
Provider balance after: 10000000 lamports
CPI Transfer successful! Transferred: 10000000 lamports
Updated start time: 2026-03-07T10:24:55.000Z
    ✔ 2. Оплачивает подписку через CPI transfer (766ms)
All data fields verified successfully!
    ✔ 3. Проверяет корректное хранение данных (90ms)
Cancel subscription tx: NENzkG4MuPa6fJ8VMWiibKz1WJv4queNoz7uLsRXjjUgf1toWDcJFzTZu556f7FkowdJyxG3meTVRf45w8f1TPe
Subscription cancelled successfully!
    ✔ 4. Отменяет подписку (530ms)
Correctly rejected payment for inactive subscription
    ✔ 5. Отклоняет оплату отменённой подписки (193ms)
Owner balance before close: 2724106760 lamports
Rent to return: 1572960 lamports
Close subscription tx: 2q7Rh6WmNoFnBaxzq8oioP3QD54nMHa2rV8bnFvDxpHuGw5bsQPnAywAQwiozTHz9JHE2SyQXLpM5HbmKjT43zpV
Subscription account closed successfully!
Owner balance after close: 2725674720 lamports
Balance change: 1567960 lamports
    ✔ 6. Закрывает подписку и возвращает rent (1322ms)
Re-create subscription tx: 4sU8pYhKHpy5Xg1Cq93HbYtKc2Fxs8uKxRMfFYX2HHSWqPQnRcMZNYDhLmP9FxRoGGVVN6VLb8krDyGhXxqMWfKP
New subscription created successfully with new parameters!
    ✔ 7. Позволяет создать новую подписку после close (961ms)
```

## Использование программы

### Создание подписки

```bash
yarn create-subscription <SERVICE_PROVIDER_ADDRESS>
```
```
yarn create-subscription 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
yarn run v1.22.22
$ ts-node scripts/create-subscription.ts 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
=== Создание подписки ===
Owner: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Service Provider: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Subscription PDA: FjoQCNEz9uxiTjDf6HHSf8LgE6Du641SnWKPPo7SDr9
Amount: 0.01 SOL
Duration: 30 days

Транзакция успешна!
TX Hash: 2ip8iYshE93AYcfJgc66gZzuWHckffXsz9o2FPcxCScw1HctQWjnuPiFyu27rRuRRF39MntJw3huj4GikC5su5wy
Explorer: https://explorer.solana.com/tx/2ip8iYshE93AYcfJgc66gZzuWHckffXsz9o2FPcxCScw1HctQWjnuPiFyu27rRuRRF39MntJw3huj4GikC5su5wy?cluster=devnet

=== Данные подписки ===
Owner: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Service Provider: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Amount: 10000000 lamports
Duration: 2592000 seconds
Start Time: 2026-03-07T10:43:52.000Z
Is Active: true
Bump: 255
```

### Оплата подписки (CPI Transfer)

```
yarn pay-subscription <SERVICE_PROVIDER_ADDRESS>
```
```
yarn pay-subscription 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm   
yarn run v1.22.22
$ ts-node scripts/pay-subscription.ts 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
=== Оплата подписки (CPI Transfer) ===
Owner: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Service Provider: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Subscription PDA: FjoQCNEz9uxiTjDf6HHSf8LgE6Du641SnWKPPo7SDr9

Сумма к оплате: 0.01 SOL
Подписка активна: true

Баланс провайдера до: 2.7225088 SOL

Транзакция успешна!
TX Hash: 5sYDHWeQswtR6UHCN9aaQieV2RKWnTpxDGxkUNrh2XYCGWCHNAMna4qcGkKSy4uHRx1Vws3cFCTRXhUNbuEyhxBd
Explorer: https://explorer.solana.com/tx/5sYDHWeQswtR6UHCN9aaQieV2RKWnTpxDGxkUNrh2XYCGWCHNAMna4qcGkKSy4uHRx1Vws3cFCTRXhUNbuEyhxBd?cluster=devnet

Баланс провайдера после: 2.7225038 SOL
Переведено: -0.000005 SOL

Обновлённое время начала: 2026-03-07T10:44:00.000Z
```

### Проверка статуса подписки

```
yarn check-subscription <SERVICE_PROVIDER_ADDRESS>
```
```
yarn check-subscription 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
yarn run v1.22.22
$ ts-node scripts/check-subscription.ts 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
=== Проверка статуса подписки ===
Owner: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Service Provider: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Subscription PDA: FjoQCNEz9uxiTjDf6HHSf8LgE6Du641SnWKPPo7SDr9

=== Данные подписки ===
Owner: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Service Provider: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Amount: 0.01 SOL
Duration: 30 days
Start Time: 2026-03-07T10:44:00.000Z
End Time: 2026-04-06T10:44:00.000Z
Is Active: true
Bump: 255

Статус: АКТИВНА
Осталось: 29 дней 23 часов
```

### Закрытие подписки (возврат rent)
```
yarn close-subscription <SERVICE_PROVIDER_ADDRESS>
```
```
arn close-subscription 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
yarn run v1.22.22
$ ts-node scripts/close-subscription.ts 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
=== Закрытие подписки ===
Owner: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Service Provider: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Subscription PDA: FjoQCNEz9uxiTjDf6HHSf8LgE6Du641SnWKPPo7SDr9

Баланс owner до: 2.7225038 SOL
Rent к возврату: 0.00157296 SOL

Подписка закрыта!
TX Hash: 3i2RDsRSZ7bVeU7hrTqNKGTJP68smN59w9vJiXXVJksWnusSR3ZRRoqvhAJ3tscJ7MkUx4zM68aXBbNJaBjr5MdT
Explorer: https://explorer.solana.com/tx/3i2RDsRSZ7bVeU7hrTqNKGTJP68smN59w9vJiXXVJksWnusSR3ZRRoqvhAJ3tscJ7MkUx4zM68aXBbNJaBjr5MdT?cluster=devnet

Баланс owner после: 2.72407176 SOL
Возвращено (примерно): 0.00156796 SOL
(минус комиссия за транзакцию)

PDA освобождён - можно создать новую подписку!
```
