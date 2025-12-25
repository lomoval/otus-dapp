package main

import (
	"fmt"
	"strings"
	"time"

	"crypto/ed25519"
)

type Blockchain struct {
	Blocks     []Block
	Difficulty int
}

type Block struct {
	Index     int
	Data      string
	Timestamp int64
	PrevHash  string
	Nonce     int
	Hash      string
	Signature []byte
}

func createGenesis() Block {
	b := Block{
		Index:     0,
		Data:      "Genesis",
		Timestamp: time.Now().Unix(),
		PrevHash:  "0",
	}
	b.mine(2)
	return b
}

func (b *Block) calculateHash() string {
	record := fmt.Sprintf("%s%d%s%d", b.Data, b.Timestamp, b.PrevHash, b.Nonce)
	return hashSHA256(record)
}

func (b *Block) mine(difficulty int) {
	prefix := strings.Repeat("0", difficulty)
	for {
		b.Hash = b.calculateHash()
		if strings.HasPrefix(b.Hash, prefix) {
			break
		}
		b.Nonce++
	}
}

func (b *Block) signBlock(priv ed25519.PrivateKey) {
	b.Signature = ed25519.Sign(priv, []byte(b.Hash))
}

func (b *Block) verifyBlock(pub ed25519.PublicKey) bool {
	return ed25519.Verify(pub, []byte(b.Hash), b.Signature)
}

func (bc *Blockchain) addBlock(data string, priv ed25519.PrivateKey) {
	prev := bc.Blocks[len(bc.Blocks)-1]

	block := Block{
		Index:     prev.Index + 1,
		Data:      data,
		Timestamp: time.Now().Unix(),
		PrevHash:  prev.Hash,
	}

	start := time.Now()
	block.mine(bc.Difficulty)
	elapsed := time.Since(start)

	block.signBlock(priv)
	bc.Blocks = append(bc.Blocks, block)

	fmt.Printf("Блок %d вычислен за %s - данные: '%s', хэш: %s\n",
		block.Index, elapsed, block.Data, block.Hash)
}

func (bc *Blockchain) isValid(pub ed25519.PublicKey) bool {
	for i := 1; i < len(bc.Blocks); i++ {
		curr := bc.Blocks[i]
		prev := bc.Blocks[i-1]

		if curr.Hash != curr.calculateHash() {
			return false
		}
		if curr.PrevHash != prev.Hash {
			return false
		}
		if !curr.verifyBlock(pub) {
			return false
		}
	}
	return true
}
