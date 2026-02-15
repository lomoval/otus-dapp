# HW10 - Развертывание сети Hyperledger Fabric и базовое взаимодействие


## Вариант 1 (Базовый): Работа с тестовой сетью Fabric Samples

Запуск тестовой сети

```
cd /<some-path>/fabric-samples/test-network/
./network.sh up
./network.sh createChannel -c otus-hw
```
```
Status: 201
{
	"name": "otus-hw",
	"url": "/participation/v1/channels/otus-hw",
	"consensusRelation": "consenter",
	"status": "active",
	"height": 1
}

Channel 'otus-hw' created
```


```
./network.sh cc list
```
```
Using docker and docker-compose
Using organization 1

Installed chaincodes on peer:
Package ID: basic_1.0:1f66cc610fb8ac88d69e78edc4c1cb09bac7c839fb5399009310ac8dfa703799, Label: basic_1.0

2026-02-15 11:19:55.191 MSK 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
Committed chaincode definitions on channel 'otus-hw':
Name: basic, Version: 1.0, Sequence: 1, Endorsement Plugin: escc, Validation Plugin: vscc
```

# Практическая часть 

## Подключение к сети

CLI на контейнере
```
docker exec -it peer0.org1.example.com bash
peer channel list
```
```
2026-02-15 08:21:51.662 UTC 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
Channels peers has joined: 
otus-hw
```
Скрипт
```
./network.sh cc list
Using docker and docker-compose
Using organization 1

Installed chaincodes on peer:
Package ID: basic_1.0:1f66cc610fb8ac88d69e78edc4c1cb09bac7c839fb5399009310ac8dfa703799, Label: basic_1.0

2026-02-15 12:16:08.916 MSK 0001 INFO [channelCmd] InitCmdFactory -> Endorser and orderer connections initialized
Committed chaincode definitions on channel 'otus-hw':
Name: basic, Version: 1.0, Sequence: 3, Endorsement Plugin: escc, Validation Plugin: vscc
```

## Деплой смарт-контракта (chaincode)
Деплоим
```
cd /<some-path>/fabric-samples/test-network/
./network.sh deployCC -c otus-hw -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go
```
Проверяем, что можно выполняить функции
```
./network.sh  cc query -c otus-hw -ccic basic -ccqc '{"function":"GetAllAssets","Args":[]}'
```
```
Using docker and docker-compose
Using organization 1
Querying on peer0.org1 on channel 'otus-hw'...
sleep: missing operand
Try 'sleep --help' for more information.
Attempting to Query peer0.org1, Retry after  seconds.
+ peer chaincode query -C otus-hw -n basic -c '{"function":"GetAllAssets","Args":[]}'
+ res=0
  []
```

## Работа с транзакциями

Установить зависимости
```
npm install
```
Установить переменную окружения к сертификатам 
```
export CRYPTO_PATH=/<some-path>/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/
```
Запустить
```
node transactions.js
```
```
--- Создание нового актива ---
Актив создан

--- Получение актива ---
Сырой результат: 123,34,65,112,112,114,97,105,115,101,100,86,97,108,117,101,34,58,49,48,48,48,44,34,67,111,108,111,114,
34,58,34,114,101,100,34,44,34,73,68,34,58,34,97,115,115,101,116,53,102,97,49,50,52,48,48,45,102,57,98,100,45,52,49,54,
101,45,56,57,57,51,45,54,49,101,101,101,57,100,97,53,52,48,101,34,44,34,79,119,110,101,114,34,58,34,84,111,109,34,44,34,
83,105,122,101,34,58,49,48,125
JSON: {
  AppraisedValue: 1000,
  Color: 'red',
  ID: 'asset5fa12400-f9bd-416e-8993-61eee9da540e',
  Owner: 'Tom',
  Size: 10
}

--- Изменение AppraisedValue, Size ---

--- Повторное получение актива ---
Сырой результат: 123,34,65,112,112,114,97,105,115,101,100,86,97,108,117,101,34,58,53,56,48,44,34,67,111,108,111,114,34,
58,34,114,101,100,34,44,34,73,68,34,58,34,97,115,115,101,116,53,102,97,49,50,52,48,48,45,102,57,98,100,45,52,49,54,101,
45,56,57,57,51,45,54,49,101,101,101,57,100,97,53,52,48,101,34,44,34,79,119,110,101,114,34,58,34,84,111,109,34,44,34,83,
105,122,101,34,58,49,57,57,51,125
JSON: {
  AppraisedValue: 580,
  Color: 'red',
  ID: 'asset5fa12400-f9bd-416e-8993-61eee9da540e',
  Owner: 'Tom',
  Size: 1993
}

```

## Мониторинг

В контракте нет функции для получения истории.  
Добавляем в `/<some-path>fabric-samples/asset-transfer-basic/chaincode-go/chaincode/smartcontract.go`
```
func (s *SmartContract) GetHistoryForAsset(ctx contractapi.TransactionContextInterface, id string) ([]map[string]interface{}, error) {
    resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var history []map[string]interface{}

    for resultsIterator.HasNext() {
        response, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var asset map[string]interface{}
        if len(response.Value) > 0 {
            err = json.Unmarshal(response.Value, &asset)
            if err != nil {
                return nil, err
            }
        } else {
            asset = nil
        }

        record := map[string]interface{}{
            "TxId":    response.TxId,
            "Value":   asset,
            "Timestamp": response.Timestamp,
            "IsDelete": response.IsDelete,
        }
        history = append(history, record)
    }
    return history, nil
}

```
Снова деплоим
```
cd /<some-path>/fabric-samples/test-network
./network.sh deployCC -c otus-hw -ccn basic -ccp ../asset-transfer-basic/chaincode-go -ccl go 
```

Запускаем скрипт
```
node history.js asset5fa12400-f9bd-416e-8993-61eee9da540e

--- История транзакций для актива asset5fa12400-f9bd-416e-8993-61eee9da540e ---

[1] TxID: e96d8b48b4441b7a20217c0a0c8516b262d2f467c31b7c3d7e72f336463e3abd
Timestamp: 2026-02-15T10:43:56.305Z
IsDelete: false
Value: {"AppraisedValue":580,"Color":"red","ID":"asset5fa12400-f9bd-416e-8993-61eee9da540e","Owner":"Tom","Size":1993}

[2] TxID: c5f95a3eb7119aadf3f5077bd05c54f52bffdb6a0b100b52d6d764c05ab57ee8
Timestamp: 2026-02-15T10:43:54.040Z
IsDelete: false
Value: {"AppraisedValue":1000,"Color":"red","ID":"asset5fa12400-f9bd-416e-8993-61eee9da540e","Owner":"Tom","Size":10
```
