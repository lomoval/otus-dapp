package main

import (
	"fmt"
	"strings"
	"time"

	"crypto/ed25519"
	"crypto/rand"

	"github.com/brianvoe/gofakeit/v6"
)

func runLevel1() {
	fmt.Println("\n===== УРОВЕНЬ 1 =====")

	msg := "Hello blockchain"
	hash := hashSHA256(msg)

	fmt.Println("\n--- Хэш и эффект лавины ---")
	fmt.Println("Исходное сообщение:", msg)
	fmt.Println("Хэш:", hash)
	mutatedMsg := mutateSymbol(msg)
	mutatedHash := hashSHA256(mutatedMsg)
	fmt.Println("Сообщение с измененным символом:", mutatedMsg)
	fmt.Println("Хэш:", mutatedHash)
	fmt.Println("Эффект лавины проверен:", strings.Compare(hash, mutatedHash) != 0)

	fmt.Println("\n--- Сопротивление предобразу ---")
	targetWord := gofakeit.Word()
	targetHash := hashSHA256(targetWord)
	fmt.Printf("Целевое слово: %s (хэш: %s)\n", targetWord, targetHash)
	for i := 0; i < 5; i++ {
		guess := gofakeit.Word()
		fmt.Printf("Проверяем слово: %s (хэш: %s) - сходится: %t\n", guess, hashSHA256(guess), hash == hashSHA256(guess))
	}

	fmt.Println("\n--- Цифровая подпись ---")
	pub, priv, _ := ed25519.GenerateKey(rand.Reader)
	msg = "Important message"
	sig := ed25519.Sign(priv, []byte(msg))
	fmt.Printf("Cообщение: %s\nПодпись: %x\nПубличный ключ: %x\n", msg, sig, pub)
	fmt.Println("Проверка подписи:", ed25519.Verify(pub, []byte(msg), sig))

	mutatedMsg = mutateSymbol(msg)
	fmt.Printf("Сообщение с измененным символом: %s\n", mutatedMsg)
	fmt.Println("Проверка подписи:", ed25519.Verify(pub, []byte(mutatedMsg), sig))

	fmt.Println("\n--- Мини-блок ---")
	block := Block{
		Data:      "Transaction data",
		Timestamp: time.Now().Unix(),
		PrevHash:  "000000",
		Nonce:     0,
	}

	block.Hash = block.calculateHash()
	block.signBlock(priv)

	fmt.Println("Блок хэш:", block.Hash)
	fmt.Println("Проверка блока:", block.verifyBlock(pub))
}
