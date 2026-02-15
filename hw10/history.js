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

const assetId = process.argv[2];
if (!assetId) {
    console.error('Использование: node history.js <ID_актива>');
    process.exit(1);
}

async function main() {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });

    const network = gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    console.log(`\n--- История транзакций для актива ${assetId} ---`);
    const result = await contract.evaluateTransaction('GetHistoryForAsset', assetId);
    const history = toObject(result)

    history.forEach((tx, index) => {
        console.log(`\n[${index + 1}] TxID: ${tx.TxId}`);
        console.log(`Timestamp: ${parseTimestamp(tx.Timestamp)}`);
        console.log(`IsDelete: ${tx.IsDelete}`);
        console.log(`Value: ${JSON.stringify(tx.Value)}`);
    });

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

function parseTimestamp(ts) {
    return new Date(ts.seconds * 1000 + Math.floor(ts.nanos / 1e6)).toISOString();
}