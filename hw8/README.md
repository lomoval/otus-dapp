# HW8 - Запуск узла NEAR и базовое взаимодействие с сетью

Вариант 1 (Базовый): Подключение к Testnet через RPC

## Установка кошелька и CLI

Создание аккаунта: https://testnet.mynearwallet.com

Установка CLI
```
npm install -g near-cli-rs@latest
```

Проверка аккаунта

```
near state testnearacc123.testnet
```
```
◐ Receiving an inquiry about your account ...                                                                                                                                                                                                                                                            
-------------------------------------------------------------------------------------------
 testnearacc123.testnet           At block #234677865 
                                  (HrfTFDLyRePfoxENUS1Nq71o6sbLHHiioW1AfrdqtANe) 
-------------------------------------------------------------------------------------------
 NEAR Social profile unavailable  The profile can be edited at https://near.social 
                                  or using the cli command: bos social-db manage-profile 
                                  (https://github.com/bos-cli-rs/bos-cli-rs) 
-------------------------------------------------------------------------------------------
 Native account balance           7.9996169725 NEAR 
-------------------------------------------------------------------------------------------
 Validator stake                  0 NEAR 
-------------------------------------------------------------------------------------------
 Storage used by the account      756 B 
-------------------------------------------------------------------------------------------
 Contract                         No contract code 
-------------------------------------------------------------------------------------------
 Access keys                      8 full access keys and 0 function-call-only access keys 
-------------------------------------------------------------------------------------------

```

Логин
```
near login
```

## Подключение к сети

```
curl https://rpc.testnet.near.org/status

StatusCode        : 200
StatusDescription : OK
Content           : {"version":{"version":"2.10.2","build":"2.10.2","commit":"41b297581fb37668d0c96d3d04cf49cdbc2b007f","rustc_version":"1.86.0"},"chain_id":"testnet","protocol_version":82,"latest_protocol_version":82,"r...
RawContent        : HTTP/1.1 200 OK
                    Connection: keep-alive
                    CF-Ray: 9c67e1bad832ec49-DME
                    CF-Cache-Status: DYNAMIC
                    Access-Control-Allow-Origin: *
                    Vary: origin, access-control-request-method, access-control-request-hea...
Forms             : {}
Headers           : {[Connection, keep-alive], [CF-Ray, 9c67e1bad832ec49-DME], [CF-Cache-Status, DYNAMIC], [Access-Control-Allow-Origin, *]...}
Images            : {}
InputFields       : {}
Links             : {}
ParsedHtml        : System.__ComObject
RawContentLength  : 1789
```

## Скрипты

Установить зависимости
```
npm installl
```

### Получение информации о последнем блоке.
```
node last-block.js
```
```
Информация о последнем блоке
Network ID: testnet
Protocol Version: 82
Height (высота): 234622361
Block Hash: CLgnP4oRT8KJ3H3MYDVorj2cVW5HNapvdbiyzCaWm9bk
Timestamp: 31.01.2026, 12:27:48
Epoch: B5Z2scVZ9uDmDvjpPNvWDtrT8X3hX3jgm3gGcHRgnd6w
Next Epoch: undefined
Sync Status: Синхронизировано
Epoch Start Height: 234618050
```

### Работа с аккаунтами

Второй аккаунт
```
near state testnearacc1234.testnet 
```
```
◓ Receiving an inquiry about your account ...                                                                                                                                                                                                                                                            
-------------------------------------------------------------------------------------------
 testnearacc1234.testnet          At block #234678394 
                                  (BePitv6JbsVkJFxyeHDZrKmEFyqKys6praCWEq23myWg) 
-------------------------------------------------------------------------------------------
 NEAR Social profile unavailable  The profile can be edited at https://near.social 
                                  or using the cli command: bos social-db manage-profile 
                                  (https://github.com/bos-cli-rs/bos-cli-rs) 
-------------------------------------------------------------------------------------------
 Native account balance           11.999958035075 NEAR 
-------------------------------------------------------------------------------------------
 Validator stake                  0 NEAR 
-------------------------------------------------------------------------------------------
 Storage used by the account      264 B 
-------------------------------------------------------------------------------------------
 Contract                         No contract code 
-------------------------------------------------------------------------------------------
 Access keys                      2 full access keys and 0 function-call-only access keys 
-------------------------------------------------------------------------------------------
```

Получение баланса

```
node balance.js 
```
```
Баланс testnearacc123.testnet:   9.999832140299999 NEAR
Баланс testnearacc1234.testnet:  9.999958035075 NEAR
```

### Отправка транзакции

Ключи уже сгенерированы при помощи `near login`.
```
 near keys testnearacc123.testnet
 ...
```
Перевод токентов
```
near send  testnearacc123.testnet  testnearacc1234.testnet  0.1
```
```
near send  testnearacc123.testnet  testnearacc1234.testnet  0.1
├  Unsigned transaction:
│    signer_id:    testnearacc123.testnet
│    receiver_id:  testnearacc1234.testnet
│    actions:
│       -- transfer deposit:    0.1 NEAR
│     
├  Warning: no access keys found in keychain, trying legacy keychain
├  Your transaction was signed successfully.
│    Public key: ed25519:AWhHhP2ZL3ot9LJKk5WCrMbpUnG47TMHH9JSvmpie9Kf
│    Signature:  ed25519:33BmPMQG5Faj2ohyaHavta2zxMGrizWG54dPEL1tWsfJ1iMhmZ468vEpTuaFvtqtm7Aq3yzRkNidTAtxSLYWYCvk
│     
├  Transaction Execution Info:
│    Gas burned: 0.224 Tgas
│    Transaction fee: 0.00002231825625 NEAR
│    Transaction ID: 6W3KEwbyYWiP3yGPfVEcM7MDe1TtRezsPqHdKc84MxrR
│    To see the transaction in the transaction explorer, please open this url in your browser:
│    https://explorer.testnet.near.org/transactions/6W3KEwbyYWiP3yGPfVEcM7MDe1TtRezsPqHdKc84MxrR
```

### Мониторинг

Запустить мониторинг
```
node monitoring.js
```
```
Отслеживание транзакций для testnearacc123.testnet...
```

Выполнить перевод
```
near send  testnearacc123.testnet  testnearacc1234.testnet  0.14
```

Мониторинг получит информацию:
```
Блок: 234691403
Хэш: 8wYSYd6wAqBfKbLfehDBkmXxdQ44gMupdt4viMmx94hr
От: testnearacc123.testnet
Для: testnearacc1234.testnet
Количество: 0.14 NEAR
Статус: Success
----------------------------------------
```