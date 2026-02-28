# HW11 - Смарт-контракт на Rust и деплоим в Solana (Уровень 1)

Установка RUST
```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Установку Solama
```
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```
```
Rust: rustc 1.93.1 (01f6ddf75 2026-02-11)
Solana CLI: solana-cli 3.0.15 (src:42c10bf3; feat:3604001754, client:Agave)
Anchor CLI: anchor-cli 0.32.1
Surfpool CLI: surfpool 1.0.0-rc1
Node.js: v25.1.0
Yarn: 1.22.22
```

Задаем devnet
```
solana config set --url devnet
```

Сощдание кошелька или можно воспользоваться текущим-тестовым
```
solana-keygen new --outfile ./counter/wallet.json
```

Задаем кошелек
```
solana config set --keypair ./counter/wallet.json
```

### Сборка проекта

В папке counter

```
anchor build
```

Пополняем баланс и деплоим
```
anchor deploy                                  
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: wallet.json
Deploying program "counter"...
Program path: counter/target/deploy/counter.so...
Program Id: 4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf

Signature: 8rZbFjgBjA9hxoDCBjZeDfzJ3oLztBctekLk99aKbiyroFWJmAvnJ65Kw5GGd4j7Zd42FEETovxfFKcTWQFwGzH

Waiting for program 4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf to be confirmed...
Program confirmed on-chain
Idl data length: 372 bytes
Step 0/372 
Idl account created: 9fyLFRkdXqvLdgQsvnBXxzc1y9T4g84iSrKidiv8xDGY
Deploy success
```
Меняем ID на полученный (Anchor.toml, lib.rs) `4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf`
Пересобираеем с новым ID.

### Использование программы

Установка зависимостей
```bash
yarn install
```

Инициализация счётчика
```
yarn initialize
```
```
Инициализация счётчика...

Wallet: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Program ID: 4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf
Counter PDA: C4Usx9tTESnRvUoLMEzf6JMb6LE9TUiiEHMjpJRpLUtT
Bump: 252

Отправка транзакции...
Счётчик успешно инициализирован!
Transaction: 3qSzo9Waf8G6KLKUdDb8qHv9CBn3Z8K8krNPAkeVQMZxZ8kqHitcnfDrTZziX3JatEZykiuTMFngqX1q9mCvRrR
Explorer: https://explorer.solana.com/tx/3qSzo9Waf8G6KLKUdDb8qHv9CBn3Z8K8krNPAkeVQMZxZ8kqHitcnfDrTZziX3JatEZykiuTMFngqX1q9mCvRrR?cluster=devnet
```

Чтение значения
```
yarn read
```
```
Чтение данных счётчика...

Wallet: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Program ID: 4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf
Counter PDA: C4Usx9tTESnRvUoLMEzf6JMb6LE9TUiiEHMjpJRpLUtT
Bump: 252

Данные счётчика:
Значение: 4
Authority: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Explorer: https://explorer.solana.com/address/C4Usx9tTESnRvUoLMEzf6JMb6LE9TUiiEHMjpJRpLUtT?cluster=devnet
```

Увеличение на 1
```
yarn increment
```
```
Увеличение счётчика...

Wallet: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Program ID: 4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf
Counter PDA: C4Usx9tTESnRvUoLMEzf6JMb6LE9TUiiEHMjpJRpLUtT
Текущее значение: 3

Отправка транзакции...
Счётчик успешно увеличен!
Transaction: 5z9FNJ8P1Xu8cMfLjwrMkqTjKiHMqAKr5VqoY68pqCpYr9STHgzy8o8wXCLt5gbfmX3LjssiEYun5zzng6YuuYd6
Explorer: https://explorer.solana.com/tx/5z9FNJ8P1Xu8cMfLjwrMkqTjKiHMqAKr5VqoY68pqCpYr9STHgzy8o8wXCLt5gbfmX3LjssiEYun5zzng6YuuYd6?cluster=devnet

Новое значение: 4
```

Уменьшение на 1
```
yarn decrement
```
```
Уменьшение счётчика...

Wallet: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Program ID: 4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf
Counter PDA: C4Usx9tTESnRvUoLMEzf6JMb6LE9TUiiEHMjpJRpLUtT
Текущее значение: 3

Отправка транзакции...
Счётчик успешно уменьшен!
Transaction: 2PT9oz34NQ8wT41URY1YEWkG4BqEcabRwQYwrAfUtwiDaZ8oeuQ2aZ3Hf8CDjCCpAv2uRnkjc58ahNU7CFCyvevh
Explorer: https://explorer.solana.com/tx/2PT9oz34NQ8wT41URY1YEWkG4BqEcabRwQYwrAfUtwiDaZ8oeuQ2aZ3Hf8CDjCCpAv2uRnkjc58ahNU7CFCyvevh?cluster=devnet

Новое значение: 2
```
Сброс
```
yarn reset
```
```
Сброс счётчика...

Wallet: 9jTsJxUDyTXuHxfoso6YRR5VneKg6nUQq5k2wvUwb1nm
Program ID: 4vLfv6YX6sMrZj9Zkzex33Teg2nLARUfdzL8SXQuNerf
Counter PDA: C4Usx9tTESnRvUoLMEzf6JMb6LE9TUiiEHMjpJRpLUtT
Текущее значение: 0

Отправка транзакции...
Счётчик успешно сброшен!
Transaction: 5cfEgJiRdF8TVQS1zk12XLXyabsb5jsmuVX9gYWLrbrwsU8RtPovuHcgMNiq2LKefS2uFrd6iwJrRgQYHos2ptCo
Explorer: https://explorer.solana.com/tx/5cfEgJiRdF8TVQS1zk12XLXyabsb5jsmuVX9gYWLrbrwsU8RtPovuHcgMNiq2LKefS2uFrd6iwJrRgQYHos2ptCo?cluster=devnet

Новое значение: 0
```