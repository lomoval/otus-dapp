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
    storageSimple = (await StorageSimple.deploy());
    await storageSimple.waitForDeployment();
  });

  describe("Развертывание", function () {
    it("Должен установить правильное начальное значение", async function () {
      expect(await storageSimple.getValue()).to.equal("");
    });

    it("Должен возвращать корректную информацию о контракте", async function () {
      const info: [string, string] = await storageSimple.getContractInfo();
      expect(info[0]).to.equal("StorageSimple Contract with onlyOwner v1.0");
      expect(info[1]).to.equal("");
    });
  });

  describe("Изменение значения", function () {
    it("Должен позволять изменять значение владельцем", async function () {
      const newValue = "New Test Value";

      await expect(storageSimple.setValue(newValue))
        .to.emit(storageSimple, "ValueChanged")
        .withArgs(newValue, owner.address);

      expect(await storageSimple.getValue()).to.equal(newValue);
    });

    it("Должен запрещать изменять значение не владельцем", async function () {
      const newValue = "Value from not owner";

      await expect(
        storageSimple.connect(addr1).setValue(newValue)
      ).to.be.revertedWith("Not owner");
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

    it("Должен запрещать изменять значение владельцем больше MAX_STRING_LENGTH", async () => {
      const longStr = "a".repeat(1028);
      await expect(
        storageSimple.connect(owner).setValue(longStr)
      ).to.be.revertedWith("Value too long");
    });
  });

  describe("Сохранение хэша", function () {
    it("Должен сохранять хэш корректно владельцем", async () => {
        const hash = ethers.keccak256(ethers.toUtf8Bytes("new hash"));
        await storageSimple.setHashedValue(hash);
        expect(await storageSimple.getHashedValue()).to.equal(hash);
    });

    it("Должен запрещать сохранять хэш не владельцем", async function () {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("new hash from not owner"));
      await expect(
        storageSimple.connect(addr1).setHashedValue(hash)
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Чтение значения", function () {
    it("Должен возвращать корректное значение после изменения", async function () {
      const newValue = "New Test Value";

      await storageSimple.setValue(newValue);
      expect(await storageSimple.getValue()).to.equal(newValue);
    });

    it("Должен возвращать корректное значение не владельцу после изменения", async function () {
      const newValue = "New Test Value";

      await storageSimple.setValue(newValue);
      expect(await storageSimple.connect(addr1).getValue()).to.equal(newValue);
    });
  });


  describe("Проверка сообщения/подписи", () => {
    it("Проверка подписи должна пройти для владельца", async () => {
        const message = "secret message";
        const messageHash = ethers.keccak256(
          ethers.toUtf8Bytes(message)
        );
        const ethHash = ethers.hashMessage(ethers.getBytes(messageHash));
        const signature = await owner.signMessage(
          ethers.getBytes(messageHash)
        );
        const sig = ethers.Signature.from(signature);
        expect(
          await storageSimple.verifyMessage(message, sig.v, sig.r, sig.s)
        ).to.equal(true);
      });

    it("Проверка подписи не должна пройти для не владельца", async () => {
      const message = "secret message";
      const messageHash = ethers.keccak256(
        ethers.toUtf8Bytes(message)
      );
      const signature = await addr1.signMessage(
         ethers.getBytes(messageHash)
      );
      const sig = ethers.Signature.from(signature);
      expect(
        await storageSimple.verifyMessage(message, sig.v, sig.r, sig.s)
      ).to.equal(false);
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
