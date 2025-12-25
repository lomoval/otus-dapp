package main

import (
	"fmt"
	"time"

	"crypto/ed25519"
	"crypto/rand"
)

func runLevel2() {
	fmt.Println("\n===== УРОВЕНЬ 2 =====")

	runDifficultyExperiments()

	simulateBlockChange()

	simulate51Attack()
}

func runDifficultyExperiments() {
	fmt.Println("\n--- Симуляция экспериментов с сложностью ---")

	difficulties := []int{2, 3, 4, 5, 6}
	blocksPerTest := 3

	_, priv, _ := ed25519.GenerateKey(rand.Reader)

	for _, diff := range difficulties {
		fmt.Printf("\nСложность = %d\n", diff)

		var totalTime time.Duration

		for i := 0; i < blocksPerTest; i++ {
			block := Block{
				Index:     i + 1,
				Data:      fmt.Sprintf("Test block %d", i+1),
				Timestamp: time.Now().Unix(),
				PrevHash:  "test",
			}

			start := time.Now()
			block.mine(diff)
			elapsed := time.Since(start)

			block.signBlock(priv)
			totalTime += elapsed

			fmt.Printf("Блок %d вычислен за %s\n", i+1, elapsed)
		}

		avg := totalTime / time.Duration(blocksPerTest)
		fmt.Printf("Среднее время вычисления блока (сложность %d): %s\n", diff, avg)
	}
}

func simulateBlockChange() {
	pub, priv, _ := ed25519.GenerateKey(rand.Reader)

	bc := Blockchain{Difficulty: 4}
	bc.Blocks = append(bc.Blocks, createGenesis())

	fmt.Println("\n--- Симуляция подмены данных ---")
	bc.addBlock("Alice -> Bob : 10", priv)
	bc.addBlock("Bob -> Charlie : 5", priv)
	bc.addBlock("Charlie -> Dave : 2", priv)
	fmt.Println("Blockchain правильный:", bc.isValid(pub))

	fmt.Printf("Блок 1: '%s' => '%s'\n", bc.Blocks[1].Data, "Alice -> Bob : 1000")
	bc.Blocks[1].Data = "Alice -> Bob : 1000"
	bc.Blocks[1].mine(bc.Difficulty)
	bc.Blocks[1].signBlock(priv)

	fmt.Println("Blockchain правильный после изменения блока:", bc.isValid(pub))
	if !bc.isValid(pub) {
		fmt.Println("Нужно перемайнить блоки 2 и 3")
		bc.Blocks = bc.Blocks[:2] // Удаляем блоки 2 и 3, чтобы сэмулировать перемайнинг
		bc.addBlock("Bob -> Charlie : 5", priv)
		bc.addBlock("Charlie -> Dave : 2", priv)
		fmt.Println("Blockchain правильный после перемайнинга:", bc.isValid(pub))
	}
}

func simulate51Attack() {
	fmt.Println("\n--- Симуляция атаки 51% ---")

	pub1, priv1, _ := ed25519.GenerateKey(rand.Reader)
	pub2, priv2, _ := ed25519.GenerateKey(rand.Reader)

	genesis := createGenesis()

	minerWeak := Miner{
		Name:    "Слабый майнер",
		Power:   1,
		PubKey:  pub1,
		PrivKey: priv1,
		Chain:   Blockchain{Difficulty: 3, Blocks: []Block{genesis}},
	}

	minerStrong := Miner{
		Name:    "Сильный майнер",
		Power:   4,
		PubKey:  pub2,
		PrivKey: priv2,
		Chain:   Blockchain{Difficulty: 3, Blocks: []Block{genesis}},
	}

	rounds := 3
	for i := 0; i < rounds; i++ {
		mineRound(&minerWeak)
		mineRound(&minerStrong)
	}

	fmt.Printf("%s наманиле блоков: %d\n", minerStrong.Name, len(minerWeak.Chain.Blocks))
	fmt.Printf("%s наманиле блоков: %d\n", minerStrong.Name, len(minerStrong.Chain.Blocks))

	total := len(minerStrong.Chain.Blocks) + len(minerWeak.Chain.Blocks)
	share := float64(len(minerStrong.Chain.Blocks)) / float64(total)

	if share > 0.51 {
		fmt.Printf("%s контролирует %.2f%% блоков (>51%%)\n", minerStrong.Name, share*100)
	} else {
		fmt.Printf("%s контролирует %.2f%% блоков (≤51%%)\n", minerStrong.Name, share*100)
	}

}

type Miner struct {
	Name    string
	Power   int // количество попыток nonce за раунд
	Chain   Blockchain
	PrivKey ed25519.PrivateKey
	PubKey  ed25519.PublicKey
}

func mineRound(miner *Miner) {
	last := miner.Chain.Blocks[len(miner.Chain.Blocks)-1]

	for i := 0; i < miner.Power; i++ {
		b := Block{
			Index:     last.Index + 1 + i,
			Data:      fmt.Sprintf("Block by %s", miner.Name),
			Timestamp: time.Now().Unix(),
			PrevHash:  last.Hash,
		}

		b.mine(miner.Chain.Difficulty)
		b.signBlock(miner.PrivKey)

		miner.Chain.Blocks = append(miner.Chain.Blocks, b)
		fmt.Printf("%s добавил блок %d\n", miner.Name, b.Index)
	}
}
