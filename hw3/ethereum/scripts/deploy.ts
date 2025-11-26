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
    },
    timestamp: new Date().toISOString(),
  };

  const outPath = path.resolve(__dirname, "../deployments.json");
  fs.writeFileSync(outPath, JSON.stringify(deploymentInfo, null, 2), "utf8");

  console.log("\n📄 Данные о развертывании сохранены в deployments.json");

  // ----------------------------------------------------
  // Конфигурация для фронта
  // ----------------------------------------------------
  const contractsConfig = {
    address: simpleAddress,
    abi: (storageSimple.interface.format()),
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
