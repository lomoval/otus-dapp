import { expect } from "chai";
import { ethers } from "hardhat";
import type {
  ContractFactory,
  Contract,
  TransactionResponse,
  TransactionReceipt,
} from "ethers";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StorageArray Contract", function () {
  let StorageArray: ContractFactory;
  let storageArray: Contract & {
    getValues: () => Promise<string[]>;
    addValue: (value: string) => Promise<TransactionResponse>;
    getValueAt: (index: number) => Promise<string>;
    getContractInfo: () => Promise<[string, [string]]>;
  };
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = (await ethers.getSigners()) as [
      SignerWithAddress,
      SignerWithAddress
    ];

    StorageArray = await ethers.getContractFactory("StorageArray");
    storageArray = (await StorageArray.deploy(["Initial1", "Initial2"])) as Contract & {
      getValues: () => Promise<string[]>;
      addValue: (value: string) => Promise<TransactionResponse>;
      getValueAt: (index: number) => Promise<string>;
      getContractInfo: () => Promise<[string, number]>;
    };
    await storageArray.waitForDeployment();
  });

  describe("Развертывание", function () {
    it("Должен сохранить начальные значения", async function () {
      const values = await storageArray.getValues();
      expect(values).to.deep.equal(["Initial1", "Initial2"]);
    });

    it("Должен вернуть информацию о контракте", async function () {
      const info = await storageArray.getContractInfo();
      expect(info[0]).to.equal("StorageArray Contract v1.0");
      expect(info[1].length).to.equal(2); 
    });
  });

  describe("Добавление значений", function () {
    it("Должен позволять добавлять новые значения", async function () {
      const newValue = "NewValue";
      await expect(storageArray.addValue(newValue))
        .to.emit(storageArray, "ValueAdded")
        .withArgs(newValue, owner.address);

      const values = await storageArray.getValues();
      expect(values).to.include(newValue);
      expect(values.length).to.equal(3);
    });

    it("Должен позволять любому добавлять значения", async function () {
      const newValue = "FromAddr1";
      await storageArray.connect(addr1).addValue(newValue);

      const values = await storageArray.getValues();
      expect(values).to.include(newValue);
      expect(values.length).to.equal(3);
    });

    it("Должен возвращать корректное значение по индексу", async function () {
      expect(await storageArray.getValueAt(0)).to.equal("Initial1");
      expect(await storageArray.getValueAt(1)).to.equal("Initial2");

      await storageArray.addValue("Third");
      expect(await storageArray.getValueAt(2)).to.equal("Third");
    });
  });

  describe("Газовые затраты", function () {
    it("Должен иметь разумные газовые затраты на addValue", async function () {
      const tx: TransactionResponse = await storageArray.addValue("Gas Test");
      const receipt: TransactionReceipt = await tx.wait();
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });

    it("Должен иметь низкие газовые затраты на getValues", async function () {
      const values = await storageArray.getValues();
      expect(values).to.be.an("array");
    });
  });
});
