// Внесем исправления в deploy.ts

import { ethers } from "hardhat";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Начинаем деплой трех контрактов...");

  const [deployer]: SignerWithAddress[] = await ethers.getSigners();
  console.log(`📝 Развертывание с аккаунта: ${deployer.address}`);
  console.log(
    `💰 Баланс: ${ethers.formatEther(
      await deployer.provider!.getBalance(deployer.address)
    )} ETH`
  );

  // ----------------------------------------------------
  //              НАЧАЛЬНЫЕ ДАННЫЕ
  // ----------------------------------------------------

  const initialSimpleValue = "Hello HW1";
  const initialArrayValues = ["Val1", "Val2", "Val3"];

  const mappingKeys: string[] = [
    ethers.getAddress("0x0000000000000000000000000000000000000001"),
    ethers.getAddress("0x0000000000000000000000000000000000000002")
  ];
  const mappingValues: string[] = [
    "SomeOption1",
    "SomeOption2"
  ];

  // ----------------------------------------------------
  // Развертывание StorageSimple
  // ----------------------------------------------------

  console.log("\n📦 Развертывание контракта StorageSimple...");
  const StorageSimple = await ethers.getContractFactory("StorageSimple");
  const storageSimple = await StorageSimple.deploy(initialSimpleValue);
  await storageSimple.waitForDeployment();

  const simpleAddress = await storageSimple.getAddress();
  console.log(`✅ StorageSimple развернут: ${simpleAddress}`);
  console.log(
    `🔗 Explorer: https://sepolia.etherscan.io/address/${simpleAddress}`
  );

  const currentSimpleValue: string = await storageSimple.getValue();
  console.log(`📊 Текущее значение: "${currentSimpleValue}"`);

  // ----------------------------------------------------
  // Развертывание StorageArray
  // ----------------------------------------------------

  console.log("\n📦 Развертывание контракта StorageArray...");
  const StorageArray = await ethers.getContractFactory("StorageArray");
  const storageArray = await StorageArray.deploy(initialArrayValues);
  await storageArray.waitForDeployment();

  const arrayAddress = await storageArray.getAddress();
  console.log(`✅ StorageArray развернут: ${arrayAddress}`);
  console.log(
    `🔗 Explorer: https://sepolia.etherscan.io/address/${arrayAddress}`
  );

  const currentArrayValue: string[] = await storageArray.getValues();
  console.log(`📊 Текущее значение: "${currentArrayValue}"`);

  // ----------------------------------------------------
  // Развертывание StorageMapping
  // ----------------------------------------------------

  console.log("\n📦 Развертывание контракта StorageMapping...");
  const StorageMapping = await ethers.getContractFactory("StorageMapping");
  const storageMapping = await StorageMapping.deploy(mappingKeys, mappingValues);
  await storageMapping.waitForDeployment();

  const mappingAddress = await storageMapping.getAddress();
  console.log(`✅ StorageMapping разверну: ${mappingAddress}`);
  console.log(
    `🔗 Explorer: https://sepolia.etherscan.io/address/${mappingAddress}`
  );

  const currentMappingValue1: string = await storageMapping.getValue(mappingKeys[0]);
  const currentMappingValue2: string = await storageMapping.getValue(mappingKeys[1]);
  console.log(`📊 Текущее значение: "${mappingKeys[0]}"-"${currentMappingValue1}"; "${mappingKeys[1]}":"${currentMappingValue2}" `);
  
  // ----------------------------------------------------
  // Сохранение данных о развертывании
  // ----------------------------------------------------

  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    contracts: {
      StorageSimple: {
        address: simpleAddress,
        initialValue: initialSimpleValue,
      },
      StorageArray: {
        address: arrayAddress,
        initialArrayValues,
      },
      StorageMapping: {
        address: mappingAddress,
        keys: mappingKeys,
        values: mappingValues,
      },
    },
    timestamp: new Date().toISOString(),
  };

  const outPath = path.resolve(__dirname, "../deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2), "utf8");

  console.log("\n📄 Данные о развертывании сохранены в deployments.json");

  // ----------------------------------------------------
  // Конфигурация для фронта
  // ----------------------------------------------------
  // Только чтобы проверить с текущей реализацией для получения одного значения.
  const contractsConfig = {
    // StorageSimple: {
      address: simpleAddress,
      abi: (storageSimple.interface.format()),
    // },
    // StorageArray: {
    //   address: arrayAddress,
    //   abi: JSON.stringify(storageArray.interface.formatJson()),
    // },
    // StorageMapping: {
    //   address: mappingAddress,
    //   abi: JSON.stringify(storageMapping.interface.formatJson()),
    // },
  };

  const configPath = path.resolve(__dirname, "../../nextjs-frontend/config/ethereumContractConfig.ts");

  const configContent = `
export const CONTRACT_CONFIG = ${JSON.stringify(contractsConfig, null, 2)};
  `;

  fs.writeFileSync(configPath, configContent, "utf8");
  console.log(`✅ Конфигурация контракта сохранена в ${configPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error("❌ Ошибка при развертывании:", error);
    process.exit(1);
  });
