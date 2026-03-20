# HW14 — NEAR Smart Contract: Message Board + Storage Staking

Расширенный смарт-контракт на Rust для NEAR Protocol.
- **message-board** — доска сообщений с регистрацией пользователей, storage staking и cross-contract верификацией
- **verifier** — внешний контракт для верификации аккаунтов

## Установка окружения

### 1. Rust + WASM target

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

rustup install 1.86.0
rustup override set 1.86.0
rustup target add wasm32-unknown-unknown --toolchain 1.86.0
```

### 2. cargo-near (сборка контрактов)

```bash
cargo install cargo-near@0.17.0 --locked
```

### 3. NEAR CLI

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/near-cli-rs/releases/latest/download/near-cli-rs-installer.sh | sh
```


## Сборка

В директории message-board и verifer

```bash
cargo near build non-reproducible-wasm
```

WASM-файлы:
- `target/near/message_board.wasm`
- `target/near/verifier.wasm`

## Тесты

```bash
cargo test
```
```
running 16 tests
test tests::test_default_has_no_messages ... ok
test tests::test_add_message_unregistered_user - should panic ... ok
test tests::test_register_with_insufficient_deposit - should panic ... ok
test tests::test_on_verify_complete_success ... ok
test tests::test_double_registration - should panic ... ok
test tests::test_on_verify_complete_rejected ... ok
test tests::test_add_message_verified_user ... ok
test tests::test_add_message_pending_user - should panic ... ok
test tests::test_on_verify_complete_promise_failed ... ok
test tests::test_get_messages_beyond_range ... ok
test tests::test_get_messages_pagination ... ok
test tests::test_existing_pagination_still_works ... ok
test tests::test_register_with_sufficient_deposit ... ok
test tests::test_storage_balance_of ... ok
test tests::test_unregister_pending_user - should panic ... ok
test tests::test_unregister_verified_user ... ok

test result: ok. 16 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.14s
```

## Деплой в testnet

```bash
./deploy.sh
```

Скрипт автоматически:
- соберёт оба контракта
- создаст аккаунты в testnet (или переиспользует из `neardev/`)
- задеплоит Verifier 
- задеплоит MessageBoard

## Вызов методов через CLI

```bash
CONTRACT_ID=$(cat neardev/dev-account)
VERIFIER_ID=$(cat neardev/verifier-account)
```

### Регистрация пользователя (с депозитом за хранение)

```bash
near contract call-function as-transaction $CONTRACT_ID register \
    json-args '{}' prepaid-gas '30.0 Tgas' \
    attached-deposit '0.1 NEAR' sign-as $CONTRACT_ID \
    network-config testnet sign-with-keychain send
```
```
   json-args '{}' prepaid-gas '30.0 Tgas' \
    attached-deposit '0.1 NEAR' sign-as $CONTRACT_ID \
    network-config testnet sign-with-keychain send
├  Unsigned transaction:
│    signer_id:    msgboard-1774039043.testnet
│    receiver_id:  msgboard-1774039043.testnet
│    actions:
│       -- function call:      
│                       method name:  register
│                       args:         {}
│                       gas:          30.0 Tgas
│                       deposit:      0.1 NEAR
│     
├  Warning: no access keys found in keychain, trying legacy keychain
├  Your transaction was signed successfully.
│    Public key: ed25519:Fki96oKkgspWAgjZmqg9fUd3bRg9WqUsn3bGCPykEBRf
│    Signature:  ed25519:2Y91SgLM3Rgm5Mq7Bf6y3GBhgGvVozdwffXwwb23b8eq3SScQCooc3MVyiC241B16kH1HYACmwPEjT3dRouAFdvx
│     
├  Transaction Execution Info:
│    Gas burned: 0.309 Tgas
│    Transaction fee: 0.000030808185934 NEAR
│    Transaction ID: 3rSZTFADGDxs7AXs9PrRCQiMPR4zAL6KGJ5FT1JbhACC
│    To see the transaction in the transaction explorer, please open this url in your browser:
│    https://explorer.testnet.near.org/transactions/3rSZTFADGDxs7AXs9PrRCQiMPR4zAL6KGJ5FT1JbhACC
│     
├  Function execution logs:
│    Logs [msgboard-1774039043.testnet]:
│      register: account=msgboard-1774039043.testnet, deposit=0.100 NEAR, storage_cost=<0.001 NEAR, gas_used=NearGas { inner: 451237560304 }
│    Logs [verifier-1774039037.testnet]:   No logs
│    Logs [msgboard-1774039043.testnet]:   No logs
│    Logs [msgboard-1774039043.testnet]:
│      on_verify_complete: account=msgboard-1774039043.testnet, gas_used=NearGas { inner: 319553558594 }
│      Refunding excess: 0.100 NEAR to msgboard-1774039043.testnet
│    Logs [msgboard-1774039043.testnet]:   No logs
│    Logs [msgboard-1774039043.testnet]:   No logs
│     

Function execution return value (printed to stdout):
true
```

### Проверка статуса верификации

```bash
near contract call-function as-read-only $CONTRACT_ID get_user_status \
    json-args '{"account_id":"'$CONTRACT_ID'"}' network-config testnet now
```
```
json-args '{"account_id":"'$CONTRACT_ID'"}' network-config testnet now
├  Logs:
│    No logs
Function execution return value (printed to stdout):
"Verified"
```
### Запись сообщения (только для верифицированных)

```bash
near contract call-function as-transaction $CONTRACT_ID add_message \
    json-args '{"text":"Hello NEAR!"}' prepaid-gas '30.0 Tgas' \
    attached-deposit '0 NEAR' sign-as $CONTRACT_ID \
    network-config testnet sign-with-keychain send
```
```
├  Unsigned transaction:
│    signer_id:    msgboard-1774039043.testnet
│    receiver_id:  msgboard-1774039043.testnet
│    actions:
│       -- function call:      
│                       method name:  add_message
│                       args:         {
│                                       "text": "Hello NEAR!"
│                                     }
│                       gas:          30.0 Tgas
│                       deposit:      0 NEAR
│     
├  Warning: no access keys found in keychain, trying legacy keychain
├  Your transaction was signed successfully.
│    Public key: ed25519:Fki96oKkgspWAgjZmqg9fUd3bRg9WqUsn3bGCPykEBRf
│    Signature:  ed25519:5dYNyA2LNijFBzZKnWHFBPjSESvcAfrjCtRiaHiPyWRmx653PsQbEh3eDYsNQTE5NEaLTERfvEpSr6w6gmyRJCg1
│     
├  Transaction Execution Info:
│    Gas burned: 0.309 Tgas
│    Transaction fee: 0.0000308133285822 NEAR
│    Transaction ID: HYd8GV5JYHxLaaBC1LQKDSmwx1bXK3mEpqpNgQqXeUWe
│    To see the transaction in the transaction explorer, please open this url in your browser:
│    https://explorer.testnet.near.org/transactions/HYd8GV5JYHxLaaBC1LQKDSmwx1bXK3mEpqpNgQqXeUWe
│     
├  Function execution logs:
│    Logs [msgboard-1774039043.testnet]:   No logs
│     
├  Function execution return value:
│    Empty return value
│     
```

### Чтение сообщений

```bash
near contract call-function as-read-only $CONTRACT_ID get_messages \
    json-args '{"from_index":0,"limit":10}' network-config testnet now
```
```
├  Logs:
│    No logs
Function execution return value (printed to stdout):
[
  "msgboard-1774039043.testnet: Hello NEAR!",
  "msgboard-1774039043.testnet: Сообщение 2"
]
```

### Баланс хранения пользователя

```bash
near contract call-function as-read-only $CONTRACT_ID storage_balance_of \
    json-args '{"account_id":"'$CONTRACT_ID'"}' network-config testnet now
```
```
├  Logs:
│    No logs
Function execution return value (printed to stdout):
"100000000000000000000000"
```

### Отмена регистрации (возврат депозита)

```bash
near contract call-function as-transaction $CONTRACT_ID unregister \
    json-args '{}' prepaid-gas '30.0 Tgas' \
    attached-deposit '0 NEAR' sign-as $CONTRACT_ID \
    network-config testnet sign-with-keychain send
```
```
├  Unsigned transaction:
│    signer_id:    msgboard-1774039043.testnet
│    receiver_id:  msgboard-1774039043.testnet
│    actions:
│       -- function call:      
│                       method name:  unregister
│                       args:         {}
│                       gas:          30.0 Tgas
│                       deposit:      0 NEAR
│     
├  Warning: no access keys found in keychain, trying legacy keychain
├  Your transaction was signed successfully.
│    Public key: ed25519:Fki96oKkgspWAgjZmqg9fUd3bRg9WqUsn3bGCPykEBRf
│    Signature:  ed25519:4iwtTVwGwjnu6rDyADWKao4nBLLGuuthVorjaaR8RyNaLob1Esnc6AFmNCD3XcP4CbhWbw7XbC3D3qgXiyZKb1AG
│     
├  Transaction Execution Info:
│    Gas burned: 0.309 Tgas
│    Transaction fee: 0.0000308086331208 NEAR
│    Transaction ID: CwMcGYNKAgJhB23tDQfHggsEQ6YZqdcXEfYazXoK5t4U
│    To see the transaction in the transaction explorer, please open this url in your browser:
│    https://explorer.testnet.near.org/transactions/CwMcGYNKAgJhB23tDQfHggsEQ6YZqdcXEfYazXoK5t4U
│     
├  Function execution logs:
│    Logs [msgboard-1774039043.testnet]:
│      Unregistered: msgboard-1774039043.testnet, refunding: 0.100 NEAR
│    Logs [msgboard-1774039043.testnet]:   No logs
│    Logs [msgboard-1774039043.testnet]:   No logs
│     
├  Function execution return value:
│    Empty return value│     
```