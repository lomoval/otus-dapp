import { expect } from "chai";
import { ethers } from "hardhat";
import type {
  ContractFactory,
  Contract,
  TransactionResponse,
  TransactionReceipt,
} from "ethers";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StorageMapping Contract", function () {
  let StorageMapping: ContractFactory;
  let storageMapping: Contract & {
    setValue: (key: string, value: string) => Promise<TransactionResponse>;
    getValue: (key: string) => Promise<string>;
    exists: (key: string) => Promise<boolean>;
    deleteValue: (key: string) => Promise<TransactionResponse>;
  };
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = (await ethers.getSigners()) as [
      SignerWithAddress,
      SignerWithAddress,
      SignerWithAddress
    ];

    StorageMapping = await ethers.getContractFactory("StorageMapping");
    storageMapping = (await StorageMapping.deploy([], [])) as Contract & {
      setValue: (key: string, value: string) => Promise<TransactionResponse>;
      getValue: (key: string) => Promise<string>;
      exists: (key: string) => Promise<boolean>;
      deleteValue: (key: string) => Promise<TransactionResponse>;
    };
    await storageMapping.waitForDeployment();
  });

  describe("Начальное состояние", function () {
    it("Должен быть пустым для всех адресов", async function () {
      expect(await storageMapping.exists(addr1.address)).to.equal(false);
      expect(await storageMapping.getValue(addr1.address)).to.equal("");
    });
  });

  describe("Установка значений", function () {
    it("Должен позволять установить значение", async function () {
      const value = "Hello";
      await expect(storageMapping.setValue(addr1.address, value))
        .to.emit(storageMapping, "ValueSet")
        .withArgs(addr1.address, value, owner.address);

      expect(await storageMapping.getValue(addr1.address)).to.equal(value);
      expect(await storageMapping.exists(addr1.address)).to.equal(true);
    });

    it("Должен позволять перезаписать значение", async function () {
      await storageMapping.setValue(addr1.address, "First");
      await expect(storageMapping.setValue(addr1.address, "Second"))
        .to.emit(storageMapping, "ValueSet")
        .withArgs(addr1.address, "Second", owner.address);

      expect(await storageMapping.getValue(addr1.address)).to.equal("Second");
    });

    it("Должен позволять другому пользователю установить значение", async function () {
      const value = "From addr1";
      await expect(storageMapping.connect(addr1).setValue(addr2.address, value))
        .to.emit(storageMapping, "ValueSet")
        .withArgs(addr2.address, value, addr1.address);

      expect(await storageMapping.getValue(addr2.address)).to.equal(value);
    });
  });

  describe("Удаление значений", function () {
    it("Должен позволять удалять значение", async function () {
      const value = "TestValue";
      await storageMapping.setValue(addr1.address, value);

      // Проверяем, что значение установлено
      expect(await storageMapping.getValue(addr1.address)).to.equal(value);

      // Удаляем значение
      await expect(storageMapping.deleteValue(addr1.address))
        .to.emit(storageMapping, "ValueDeleted")
        .withArgs(addr1.address, owner.address);

      // Проверяем, что значение удалено
      expect(await storageMapping.getValue(addr1.address)).to.equal("");
      expect(await storageMapping.exists(addr1.address)).to.equal(false);
    });

    it("Должен выбрасывать ошибку при попытке удалить несуществующее значение", async function () {
      // Попытка удалить несуществующее значение
      await expect(storageMapping.deleteValue(addr2.address))
        .to.be.revertedWith("Value does not exist");
    });
  });

  describe("Работа с несколькими адресами", function () {
    it("Должен хранить значения независимо для разных адресов", async function () {
      await storageMapping.setValue(addr1.address, "Value1");
      await storageMapping.setValue(addr2.address, "Value2");

      expect(await storageMapping.getValue(addr1.address)).to.equal("Value1");
      expect(await storageMapping.getValue(addr2.address)).to.equal("Value2");
    });
  });

  describe("Газовые затраты", function () {
    it("setValue должен иметь разумные затраты газа", async function () {
      const tx: TransactionResponse = await storageMapping.setValue(addr1.address, "GasTest");
      const receipt: TransactionReceipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lessThan(100000);
    });

    it("getValue не требует газа и возвращает корректное значение", async function () {
      await storageMapping.setValue(addr1.address, "Test");
      const value = await storageMapping.getValue(addr1.address);
      expect(value).to.equal("Test");
    });
  });
});
