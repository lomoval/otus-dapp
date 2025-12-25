package main

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strings"
)

func main() {
	level, err := readLevel()
	if err != nil {
		fmt.Println("Ошибка:", err)
		fmt.Println("Запуск Уровня 1 по умолчанию")
		runLevel1()
		return
	}

	switch level {
	case 1:
		runLevel1()
	case 2:
		runLevel2()
	}
}

func readLevel() (int, error) {
	fmt.Print("Выберите уровень (1 или 2): ")
	in := bufio.NewReader(os.Stdin)
	text, _ := in.ReadString('\n')
	text = strings.TrimSpace(text)

	if text == "1" {
		return 1, nil
	}
	if text == "2" {
		return 2, nil
	}
	return 0, errors.New("неверный ввод")
}
