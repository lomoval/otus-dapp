const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateVoting", function () {
  let voting;
  let owner, voter1, voter2, voter3, outsider;

  const topic = "Лучшая блокчейн-платформа";
  const candidates = ["Ethereum", "Solana", "Polkadot"];

  // Вспомогательная функция: создание коммита
  function createCommitment(candidateIndex, salt) {
    return ethers.solidityPackedKeccak256(
      ["uint8", "bytes32"],
      [candidateIndex, salt]
    );
  }

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, outsider] = await ethers.getSigners();

    const PrivateVoting = await ethers.getContractFactory("PrivateVoting");
    voting = await PrivateVoting.deploy(
      topic,
      candidates,
      [voter1.address, voter2.address, voter3.address]
    );
  });

  describe("Развёртывание", function () {
    it("Должен установить тему и кандидатов", async function () {
      expect(await voting.topic()).to.equal(topic);
      expect(await voting.candidateCount()).to.equal(3);
      expect(await voting.candidates(0)).to.equal("Ethereum");
      expect(await voting.candidates(1)).to.equal("Solana");
      expect(await voting.candidates(2)).to.equal("Polkadot");
    });

    it("Должен начинаться в фазе Commit", async function () {
      expect(await voting.phase()).to.equal(0); // Commit
    });

    it("Должен регистрировать разрешённых избирателей", async function () {
      expect(await voting.allowedVoters(voter1.address)).to.be.true;
      expect(await voting.allowedVoters(outsider.address)).to.be.false;
    });
  });

  describe("Фаза фиксации (Commit)", function () {
    it("Должен позволять избирателям фиксировать голос", async function () {
      const salt = ethers.randomBytes(32);
      const commitment = createCommitment(1, salt);

      await expect(voting.connect(voter1).commitVote(commitment))
        .to.emit(voting, "VoteCommitted")
        .withArgs(voter1.address);
    });

    it("Должен отклонять неавторизованных избирателей", async function () {
      const salt = ethers.randomBytes(32);
      const commitment = createCommitment(1, salt);

      await expect(
        voting.connect(outsider).commitVote(commitment)
      ).to.be.revertedWith("Нет права голосовать");
    });

    it("Должен отклонять повторную фиксацию", async function () {
      const salt = ethers.randomBytes(32);
      const commitment = createCommitment(1, salt);

      await voting.connect(voter1).commitVote(commitment);
      await expect(
        voting.connect(voter1).commitVote(commitment)
      ).to.be.revertedWith("Голос уже зафиксирован");
    });

    it("Должен скрывать голос (фиксация не раскрывает выбор)", async function () {
      const salt1 = ethers.randomBytes(32);
      const salt2 = ethers.randomBytes(32);

      const commit1 = createCommitment(1, salt1); // Ethereum
      const commit2 = createCommitment(2, salt2); // Solana

      expect(commit1).to.not.equal(commit2);

      const commit3 = createCommitment(1, salt2);
      expect(commit1).to.not.equal(commit3);
    });
  });

  describe("Фаза раскрытия (Reveal)", function () {
    let salt1, salt2;

    beforeEach(async function () {
      salt1 = ethers.randomBytes(32);
      salt2 = ethers.randomBytes(32);

      // Фиксация голосов
      await voting.connect(voter1).commitVote(createCommitment(1, salt1));
      await voting.connect(voter2).commitVote(createCommitment(2, salt2));

      // Переход в фазу Reveal
      await voting.connect(owner).nextPhase();
    });

    it("Должен позволять корректное раскрытие", async function () {
      await expect(voting.connect(voter1).revealVote(1, salt1))
        .to.emit(voting, "VoteRevealed")
        .withArgs(voter1.address, 1);
    });

    it("Должен отклонять неверную соль", async function () {
      const wrongSalt = ethers.randomBytes(32);
      await expect(
        voting.connect(voter1).revealVote(1, wrongSalt)
      ).to.be.revertedWith("Несоответствие фиксации");
    });

    it("Должен отклонять неверного кандидата", async function () {
      await expect(
        voting.connect(voter1).revealVote(2, salt1) // зафиксировал 1, пытается раскрыть 2
      ).to.be.revertedWith("Несоответствие фиксации");
    });

    it("Должен отклонять раскрытие от избирателя без фиксации", async function () {
      await expect(
        voting.connect(voter3).revealVote(1, salt1)
      ).to.be.revertedWith("Голос не зафиксирован");
    });

    it("Должен отклонять повторное раскрытие", async function () {
      await voting.connect(voter1).revealVote(1, salt1);
      await expect(
        voting.connect(voter1).revealVote(1, salt1)
      ).to.be.revertedWith("Голос уже раскрыт");
    });
  });

  describe("Полный цикл голосования", function () {
    it("Должен корректно подсчитывать голоса через все фазы", async function () {
      const salt1 = ethers.randomBytes(32);
      const salt2 = ethers.randomBytes(32);
      const salt3 = ethers.randomBytes(32);

      // Фаза 1: Фиксация
      await voting.connect(voter1).commitVote(createCommitment(1, salt1)); // Ethereum
      await voting.connect(voter2).commitVote(createCommitment(1, salt2)); // Ethereum
      await voting.connect(voter3).commitVote(createCommitment(2, salt3)); // Solana

      // Фаза 2: Раскрытие
      await voting.connect(owner).nextPhase();
      expect(await voting.phase()).to.equal(1); // Reveal

      await voting.connect(voter1).revealVote(1, salt1);
      await voting.connect(voter2).revealVote(1, salt2);
      await voting.connect(voter3).revealVote(2, salt3);

      // Фаза 3: Подсчёт
      await voting.connect(owner).nextPhase();
      expect(await voting.phase()).to.equal(2); // Tally

      // Проверка результатов
      expect(await voting.getVoteCount(1)).to.equal(2); // Ethereum: 2
      expect(await voting.getVoteCount(2)).to.equal(1); // Solana: 1
      expect(await voting.getVoteCount(3)).to.equal(0); // Polkadot: 0
      expect(await voting.totalRevealed()).to.equal(3);
    });
  });

  describe("Управление фазами", function () {
    it("Должен запрещать фиксацию в фазе раскрытия", async function () {
      await voting.connect(owner).nextPhase();
      const salt = ethers.randomBytes(32);
      await expect(
        voting.connect(voter1).commitVote(createCommitment(1, salt))
      ).to.be.revertedWith("Неверная фаза");
    });

    it("Должен запрещать раскрытие в фазе фиксации", async function () {
      const salt = ethers.randomBytes(32);
      await voting.connect(voter1).commitVote(createCommitment(1, salt));
      await expect(
        voting.connect(voter1).revealVote(1, salt)
      ).to.be.revertedWith("Неверная фаза");
    });

    it("Должен позволять смену фазы только владельцу", async function () {
      await expect(
        voting.connect(voter1).nextPhase()
      ).to.be.revertedWith("Только владелец");
    });

    it("Не должен переходить дальше фазы подсчёта", async function () {
      await voting.connect(owner).nextPhase(); // -> Reveal
      await voting.connect(owner).nextPhase(); // -> Tally
      await expect(
        voting.connect(owner).nextPhase()
      ).to.be.revertedWith("Уже в финальной фазе");
    });
  });
});
