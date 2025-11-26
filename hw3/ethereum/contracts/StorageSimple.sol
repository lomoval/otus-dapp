// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StorageSimple
 * @dev Контракт с хранением строки, хэша и проверкой подписи владельца
 */
contract StorageSimple {
    uint256 public constant MAX_STRING_LENGTH = 1024;

    string private storedData;
    bytes32 private storedHash;
    address public owner;

    event ValueChanged(string newValue, address indexed changedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setValue(string memory newValue) public onlyOwner {
        require(bytes(newValue).length <= MAX_STRING_LENGTH, "Value too long");
        storedData = newValue;
        emit ValueChanged(newValue, msg.sender);
    }

    function getValue() public view returns (string memory) {
        return storedData;
    }

    function setHashedValue(bytes32 hash) public onlyOwner {
        storedHash = hash;
    }

    function getHashedValue() public view returns (bytes32) {
        return storedHash;
    }

    function getContractInfo()
        public
        view
        returns (string memory, string memory) {
        return ("StorageSimple Contract with onlyOwner v1.0", storedData);
    }

    /// @dev Проверка, что сообщение подписано владельцем
    function verifyMessage(
        string memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        bytes32 prefixed = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        address signer = ecrecover(prefixed, v, r, s);
        return signer == owner;
    }
}
