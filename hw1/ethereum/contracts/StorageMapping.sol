// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StorageMapping
 * @dev Контракт для хранения пар ключ-значение (address => string)
 */
contract StorageMapping {
    mapping(address => string) private storedData;

    constructor(address[] memory keys, string[] memory values) {
        require(keys.length == values.length, "Length mismatch");

        for (uint256 i = 0; i < keys.length; i++) {
            storedData[keys[i]] = values[i];
        }
    }

    event ValueSet(address indexed key, string value, address indexed changedBy);
    event ValueDeleted(address indexed key, address indexed deletedBy);

    /**
     * @dev Установка значения по ключу
     * @param key Адрес-ключ
     * @param value Строковое значение
     */
    function setValue(address key, string memory value) public {
        storedData[key] = value;
        emit ValueSet(key, value, msg.sender);
    }

    /**
     * @dev Получение значения по ключу
     * @param key Адрес-ключ
     * @return Значение
     */
    function getValue(address key) public view returns (string memory) {
        return storedData[key];
    }

    /**
     * @dev Проверка, существует ли значение для адреса
     * @param key Адрес-ключ
     * @return true, если значение установлено и не пустое
     */
    function exists(address key) public view returns (bool) {
        return bytes(storedData[key]).length > 0;
    }

    /**
     * @dev Удаление значения по ключу
     * @param key Адрес-ключ
     */
    function deleteValue(address key) public {
        require(bytes(storedData[key]).length > 0, "Value does not exist");

        delete storedData[key];
        emit ValueDeleted(key, msg.sender);
    }
}
