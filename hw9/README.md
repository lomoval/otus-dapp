# HW9 - Запуск узла TON и базовое взаимодействие с сетью

Вариант 1 (Базовый): Подключение к Testnet через RPC

```
nmp install
```

**Получение базовой информацию о сети, блоках.**

```
node info.js
```
```
Подключение к TON Testnet...

Информация о сети TON:
Время сети (UNIX): 1770463964
Время сети (читаемое): 07.02.2026, 14:32:44
Последний блок: #40601311
Workchain: -1
Shard: -9223372036854775808
Версия: 0

Последние 3 блока:

Блок #40601311:
   Время: 07.02.2026, 14:32:44
   Хеш: b8ZT0Nvw0kUvEFCrIoJVxOROmrgNXGNqRw+hZY7kaeY=

Блок #40601310:
   Время: 07.02.2026, 14:32:43
   Хеш: PC7OQfMFfWsF8UcnN/tsguimvRaqYvJSkaVc5Hiw+Hw=

Блок #40601309:
   Время: 07.02.2026, 14:32:42
   Хеш: 2vgI547WNv45SP8YR5z5mullks4b7hc4hSB/SKVkLus=
```



## Подключение к сети

### Получение информации о последнем блоке.
```
node last-block.js
```
```
Статус мастерчейна:
Workchain: -1
Shard: -9223372036854775808
Seqno (номер блока): 40595405
Root hash: 4CAFsZvEqFFHe2WedJuIkD8PITc7avsV3Y017EPYPUI=
File hash: mL3YPpeVk15BnTbcfF7OLhGPqT11CkXPEk7zolj1j08=
```

### Работа с аккаунтами

Создание аккаунтов
```
node create-wallet.js
```
```
Создание нового аккаунта TON (Testnet)

Информация о кошельке:
----------------------
Адрес (raw): 0:6934de0eb1d84f8c0e8b7ae3be62137dfbedb5bca07e25c4c97aa575a0113ce1
Адрес (bounceable): EQBpNN4OsdhPjA6LeuO-YhN9--21vKB-JcTJeqV1oBE84VRU
Адрес (non-bounceable): UQBpNN4OsdhPjA6LeuO-YhN9--21vKB-JcTJeqV1oBE84QmR

Ключи:
------------------------------------
Public key (hex): 05be0746e8e5a2b17684be4d0436cc9a92286735353a678404ca653fbc93a2da
Secret key (hex): d894e448d545e1230ed0192fb129aa90a5bb3083b6a7f688a71375181e67020705be0746e8e5a2b17684be4d0436cc9a92286735353a678404ca653fbc93a2da
```
Данные об аккаунтах можно добавить в config.json


Получение баланса

```
node balance.js 
```
```
Проверка баланса TON
Аккаунт 0:1746a54620e3a79d5738760c738c52fb1f5d239fa683a205c85a4608d9558b4f
Статус: uninitialized
Баланс: 0 TON

Аккаунт 0:9731461359daa678b3000c804f4cbc1c9cf10[accounts.txt](accounts.txt)8a74e0c1f659c435ac56fcdabd8
Статус: uninitialized
Баланс: 0 TON
```

После транзакции на зачисление тестовых монет
```
node balance.js
```
```
Аккаунт 0:1746a54620e3a79d5738760c738c52fb1f5d239fa683a205c85a4608d9558b4f
Статус: uninitialized
Баланс: 1.999999993 TON

Аккаунт 0:9731461359daa678b3000c804f4cbc1c9cf108a74e0c1f659c435ac56fcdabd8
Статус: uninitialized
Баланс: 1995418790 TON
```

Когда баланс не 0-й можно инициализировать (задеплоить) кошельки

```
node deploy-wallets.js
Адрес: EQAXRqVGIOOnnVc4dgxzjFL7H10jn6aDogXIWkYI2VWLT5SZ
Баланс: 1999999993
Seqno: null
Результат деплоя: { '@type': 'ok' }

ес: EQCXMUYTWdqmeLMADIBPTLwcnPEIp04MH2WcQ1rFb82r2Oky
Баланс: 1995418790
Seqno: null
Результат деплоя: { '@type': 'ok' }
```

При повторном запуске получим seqno

```
node deploy-wallets.js
Адрес: EQAXRqVGIOOnnVc4dgxzjFL7H10jn6aDogXIWkYI2VWLT5SZ
Баланс: 1995418754
Seqno: 1
Кошелек уже задеплоин. Seqno: 1

Адрес: EQCXMUYTWdqmeLMADIBPTLwcnPEIp04MH2WcQ1rFb82r2Oky
Баланс: 1995418790
Seqno: 1
Кошелек уже задеплоин. Seqno: 1
```

Если проверить баланс, то кошельки будут активны
```
Аккаунт 0:1746a54620e3a79d5738760c738c52fb1f5d239fa683a205c85a4608d9558b4f
Статус: active
Баланс: 1.995418754 TON

Аккаунт 0:9731461359daa678b3000c804f4cbc1c9cf108a74e0c1f659c435ac56fcdabd8
Статус: active
Баланс: 1.99541879 TON
```

### Отправка транзакции
```
node transaction.js
```
```
Отправка транзакции TON (Testnet)
Отправитель:
0:1746a54620e3a79d5738760c738c52fb1f5d239fa683a205c85a4608d9558b4f

Получатель:
0:9731461359daa678b3000c804f4cbc1c9cf108a74e0c1f659c435ac56fcdabd8
Текущий seqno: 9
Сумма перевода: 0.03 TON

Транзакция отправлена успешно
Ожидаем подтверждение...

Транзакция подтверждена
Новый seqno: 10
Отправлено: 0.03 TON
Хэш последней транзакции: VPJRrtnA4CRFFSijzGP4KeNgMHahi9cqBJiqVhHllYk=
Статус: подтверждена
```

### Мониторинг

Запустить мониторинг
```
node monitoring.js
```
```
Мониторинга входящих транзакций...
Адрес: 0:9731461359daa678b3000c804f4cbc1c9cf108a74e0c1f659c435ac56fcdabd8
```

Выполнить перевод
```
node transaction.js
```

Мониторинг получит информацию:
```
Новая входящая транзакция:
Hash: iksaqE3MOaPJ7Ve/xls00y6Ofbb04/VRcZkjoCtWSqg=
Lt: 47344599000003
Сумма: 0.057 TON
Ссылка: https://testnet.tonscan.org/tx/iksaqE3MOaPJ7Ve/xls00y6Ofbb04/VRcZkjoCtWSqg=```