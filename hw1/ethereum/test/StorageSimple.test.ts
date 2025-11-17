import { expect } from "chai";
import { ethers } from "hardhat";
import type {
  ContractFactory,
  Contract,
  TransactionResponse,
  TransactionReceipt,
} from "ethers";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StorageSimple Contract", function () {
  let StorageSimple: ContractFactory;
  let storageSimple: Contract & {
    getValue: () => Promise<string>;
    setValue: (value: string) => Promise<TransactionResponse>;
    getContractInfo: () => Promise<[string, string]>;
  };
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = (await ethers.getSigners()) as [
      SignerWithAddress,
      SignerWithAddress
    ];

    StorageSimple = await ethers.getContractFactory("StorageSimple");
    storageSimple = (await StorageSimple.deploy("Initial Value")) as Contract & {
      getValue: () => Promise<string>;
      setValue: (value: string) => Promise<TransactionResponse>;
      getContractInfo: () => Promise<[string, string]>;
    };
    await storageSimple.waitForDeployment();
  });

  describe("Развертывание", function () {
    it("Должен установить правильное начальное значение", async function () {
      expect(await storageSimple.getValue()).to.equal("Initial Value");
    });

    it("Должен возвращать корректную информацию о контракте", async function () {
      const info: [string, string] = await storageSimple.getContractInfo();
      expect(info[0]).to.equal("StorageSimple Contract v1.0");
      expect(info[1]).to.equal("Initial Value");
    });
  });

  describe("Изменение значения", function () {
    it("Должен позволять изменять значение", async function () {
      const newValue = "New Test Value";

      await expect(storageSimple.setValue(newValue))
        .to.emit(storageSimple, "ValueChanged")
        .withArgs(newValue, owner.address);

      expect(await storageSimple.getValue()).to.equal(newValue);
    });

    it("Должен позволять любому изменять значение", async function () {
      const newValue = "Value from another account";

      await storageSimple.connect(addr1).setValue(newValue);
      expect(await storageSimple.getValue()).to.equal(newValue);
    });

    it("Должен эмитировать событие при изменении", async function () {
      const newValue = "Event Test Value";

      const tx: TransactionResponse = await storageSimple.setValue(newValue);
      const receipt: TransactionReceipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.eventName === "ValueChanged"
      ) as { args: { newValue: string; changedBy: string }; eventName: string };
      expect(event.args.newValue).to.equal(newValue);
      expect(event.args.changedBy).to.equal(owner.address);
    });
  });

  describe("Чтение значения", function () {
    it("Должен возвращать корректное значение после изменения", async function () {
      const testValues = ["First", "Second", "Third"];

      for (const value of testValues) {
        await storageSimple.setValue(value);
        expect(await storageSimple.getValue()).to.equal(value);
      }
    });
  });

  describe("Газовые затраты", function () {
    it("setValue должен иметь разумные затраты газа", async function () {
      const tx: TransactionResponse = await storageSimple.setValue("Gas Test");
      const receipt: TransactionReceipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lessThan(100000);
    });

    it("getValue не требует газа и возвращает корректное значение", async function () {
      const value = await storageSimple.getValue();
      expect(value).to.be.a("string");
    });
  });
});
