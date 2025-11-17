// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StorageArray
 * @dev Контракт для хранения массива строк с добавлением и чтением элементов
 */
contract StorageArray {
    string[] private storedData;

    // Событие при добавлении нового значения
    event ValueAdded(string newValue, address indexed addedBy);

    /**
     * @dev Конструктор может инициализировать контракт с начальными значениями (опционально)
     * @param initialValues Начальный массив значений
     */
    constructor(string[] memory initialValues) {
        for (uint i = 0; i < initialValues.length; i++) {
            storedData.push(initialValues[i]);
            emit ValueAdded(initialValues[i], msg.sender);
        }
    }

    /**
     * @dev Добавление нового значения в массив
     * @param newValue Новое значение для добавления
     */
    function addValue(string memory newValue) public {
        storedData.push(newValue);
        emit ValueAdded(newValue, msg.sender);
    }

    /**
     * @dev Получение всего массива значений
     */
    function getValues() public view returns (string[] memory) {
        return storedData;
    }

    /**
     * @dev Получение длины массива
     */
    function getLength() public view returns (uint) {
        return storedData.length;
    }

    /**
     * @dev Получение конкретного элемента по индексу
     */
    function getValueAt(uint index) public view returns (string memory) {
        require(index < storedData.length, "Index out of bounds");
        return storedData[index];
    }

    /**
     * @dev Вспомогательная функция для получения информации о контракте
     * @return Название контракта и текущее значение
     */
    function getContractInfo()
        public
        view
        returns (string memory, string[] memory) {
        return ("StorageArray Contract v1.0", storedData);
    }
}

