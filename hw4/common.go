package main

import (
	"crypto/sha256"
	"encoding/hex"
	"math/rand"
)

func hashSHA256(data string) string {
	sum := sha256.Sum256([]byte(data))
	return hex.EncodeToString(sum[:])
}

func mutateSymbol(s string) string {
	runes := []rune(s)
	pos := rand.Intn(len(runes))

	original := runes[pos]
	newChar := original

	for newChar == original {
		newChar = rune(rand.Intn(94) + 33) // печатные ASCII
	}

	runes[pos] = newChar
	return string(runes)
}
