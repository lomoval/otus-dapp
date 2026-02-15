'use strict';

const { v4: uuidv4 } = require('uuid');
const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { TextDecoder } = require('node:util');

const channelName = envOrDefault('CHANNEL_NAME', 'otus-hw');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    path.resolve(
        __dirname,
        '..',
        '..',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

const utf8Decoder = new TextDecoder();
const peerEndpoint = 'localhost:7051';
const peerHostAlias = 'peer0.org1.example.com';

async function main() {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });

    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const assetId = 'asset-' + uuidv4();

    console.log('\n--- Создание нового актива ---');
    await contract.submitTransaction(
        'CreateAsset',
        assetId,
        'red',
        '10',
        'Tom',
        '1000'
    );
    console.log('Актив создан');

    console.log('\n--- Получение актива ---');
    let result = await contract.evaluateTransaction('ReadAsset', assetId);
    let asset = toObject(result)
    console.log('Сырой результат:', result.toString());
    console.log('JSON:', asset);

    console.log('\n--- Изменение AppraisedValue, Size ---');
    await contract.submitTransaction(
        'UpdateAsset',
            asset.ID,
            asset.Color,
            (asset.AppraisedValue + randInt(1000)).toString(),
            asset.Owner,
            (asset.Size + randInt(1000)).toString()
    );

    console.log('\n--- Повторное получение актива ---');
    result = await contract.evaluateTransaction('ReadAsset', assetId);
    console.log('Сырой результат:', result.toString());
    outputJson(result);

    gateway.close();
    client.close();
}

async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity() {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner() {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

function outputJson(bytes) {
    const resultJson = utf8Decoder.decode(bytes);
    const jsonResult = JSON.parse(resultJson);
    console.log('JSON:', jsonResult);
}

function toObject(bytes) {
    const resultJson = utf8Decoder.decode(bytes);
    return JSON.parse(resultJson);
}

function randInt(max) {
    return Math.floor(Math.random() * max) + 1;
}