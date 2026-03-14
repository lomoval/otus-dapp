# HW13 — NEAR Smart Contract: Message Board

Смарт-контракт на Rust для NEAR Protocol. Хранит список сообщений с методами записи и чтения.

## Установка окружения

### 1. Rust + WASM target

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# NEAR VM требует Rust 1.86
rustup install 1.86.0
rustup override set 1.86.0
rustup target add wasm32-unknown-unknown --toolchain 1.86.0
```

### 2. cargo-near (сборка контрактов)

```bash
cargo install cargo-near
```

### 3. NEAR CLI

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/near/near-cli-rs/releases/latest/download/near-cli-rs-installer.sh | sh
```

## Контракт
Сборка
```bash
cargo near build non-reproducible-wasm
```

WASM-файл: `target/near/message_board.wasm`

### Тесты

```bash
cargo test
```
```
  Compiling message-board v0.1.0 (/Users/lomov/Seafile/Work/projects/otus/otus-dapp/hw13)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1.51s
     Running unittests src/lib.rs (target/debug/deps/message_board-aa7debdc26f3bdf4)

running 4 tests
test tests::test_default_has_no_messages ... ok
test tests::test_get_messages_pagination ... ok
test tests::test_get_messages_beyond_range ... ok
test tests::test_add_and_get_messages ... ok

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.02s
```

## Деплой в testnet

```bash
./deploy.sh
```

Скрипт автоматически:
- соберёт контракт
- создаст аккаунт в testnet (или переиспользует из `neardev/dev-account`)
- задеплоит контракт

```
Создаем аккаунт: msgboard-1773483026.testnet
├  Your transaction:
│    signer_id:    testnet
│    actions:
│       -- create account:      msgboard-1773483026.testnet
│       -- add access key:     
│                       public key:   ed25519:HVozMG4bEhSLaMfQZLZpopPWaSnEByAe84yyUT2WHg6u
│                       permission:   FullAccess
│     
├  Transaction Execution Info:
│    Transaction ID: AbNqcv45EjWcmNMoBJKiayRKDM1HNHw1PYbw2P8245b6
│    To see the transaction in the transaction explorer, please open this url in your browser:
│    https://explorer.testnet.near.org/transactions/AbNqcv45EjWcmNMoBJKiayRKDM1HNHw1PYbw2P8245b6

New account <msgboard-1773483026.testnet> created successfully.

Here is your console command if you need to script it or re-run:
    near account create-account sponsor-by-faucet-service msgboard-1773483026.testnet autogenerate-new-keypair save-to-legacy-keychain network-config testnet create

Аккаунт сохранен в ./neardev/dev-account
Деплоим msgboard-1773483026.testnet...
├  Unsigned transaction:
│    signer_id:    msgboard-1773483026.testnet
│    receiver_id:  msgboard-1773483026.testnet
│    actions:
│       -- deploy code <FUyH7mJtW3sQNx1A7B1K4J1gAyWiLaLV8FTTcDxWFY4Z> to a account <msgboard-1773483026.testnet>
│     
├  Your transaction was signed successfully.
│    Public key: ed25519:HVozMG4bEhSLaMfQZLZpopPWaSnEByAe84yyUT2WHg6u
│    Signature:  ed25519:uPCKWye43E17WuozsYVjnkC6ApJ13dx5QaRcHQfsZhW2vCq28qL6ZERj4MGPkDo471GKAFemCby76DJbg683o5E
│     
├  Transaction Execution Info:
│    Gas burned: 1.1 Tgas
│    Transaction fee: 0.000109491962227 NEAR
│    Transaction ID: F4negwsCB1SoAagXqHYrrr648PdUuVELNkbqkMipgi11
│    To see the transaction in the transaction explorer, please open this url in your browser:
│    https://explorer.testnet.near.org/transactions/F4negwsCB1SoAagXqHYrrr648PdUuVELNkbqkMipgi11
│     

Contract code has been successfully deployed.
```

## Вызов методов через CLI

Прочитать имя аккаунта
```bash
CONTRACT_ID=$(cat neardev/dev-account)
```

Записать сообщение
```
near contract call-function as-transaction $CONTRACT_ID add_message \
    json-args '{"text":"Hello NEAR!"}' prepaid-gas '30.0 Tgas' \
    attached-deposit '0 NEAR' sign-as $CONTRACT_ID \
    network-config testnet sign-with-keychain send
```
```
 json-args '{"text":"Hello NEAR!"}' prepaid-gas '30.0 Tgas' \
    attached-deposit '0 NEAR' sign-as $CONTRACT_ID \
    network-config testnet sign-with-keychain send
├  Unsigned transaction:
│    signer_id:    msgboard-1773480311.testnet
│    receiver_id:  msgboard-1773480311.testnet
│    actions:
│       -- function call:      
│                       method name:  add_message
│                       args:         {
│                                       "text": "Hello NEAR!"
│                                     }
│                       gas:          30.0 Tgas
│                       deposit:      0 NEAR
│     
├  Your transaction was signed successfully.
│    Public key: ed25519:CgNWd5EwpHBbwXQqsUPfPtmjwkQayNu6SZetdpH7kBUD
│    Signature:  ed25519:31rDWu6Bn5kDdEmrPcgKYA3s2mGqqHb2k5SBKyB4cSxhKmbTTfYXuNn7aEvPjzV52P8Sb95ZGpHVYtMPbViptEtX
│     
├  Transaction Execution Info:
│    Gas burned: 0.309 Tgas
│    Transaction fee: 0.0000308133285822 NEAR
│    Transaction ID: CWvVGemMrc158LzzeM7pxnP8JG7V3VCZR9JEAjmPL7uZ
│    To see the transaction in the transaction explorer, please open this url in your browser:
│    https://explorer.testnet.near.org/transactions/CWvVGemMrc158LzzeM7pxnP8JG7V3VCZR9JEAjmPL7uZ
│     
├  Function execution logs:
│    Logs [msgboard-1773480311.testnet]:   No logs
│     
├  Function execution return value:
│    Empty return value
```

Прочитать сообщения
```
near contract call-function as-read-only $CONTRACT_ID get_messages \
    json-args '{"from_index":0,"limit":10}' network-config testnet now
```
```
   json-args '{"from_index":0,"limit":10}' network-config testnet now
├  Logs:
│    No logs
Function execution return value (printed to stdout):
[
  "msgboard-1773480311.testnet: Hello NEAR!",
  "msgboard-1773480311.testnet: Test message 2!"
]
```

Количество сообщений
```
near contract call-function as-read-only $CONTRACT_ID total_messages \
    json-args '{}' network-config testnet now
```
```
json-args '{}' network-config testnet now
├  Logs:
│    No logs
Function execution return value (printed to stdout):
2
```