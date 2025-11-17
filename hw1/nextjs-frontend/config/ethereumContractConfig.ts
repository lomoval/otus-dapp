
export const CONTRACT_CONFIG = {
  "address": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  "abi": [
    "constructor(string initialValue)",
    "event ValueChanged(string newValue, address indexed changedBy)",
    "function getContractInfo() view returns (string, string)",
    "function getValue() view returns (string)",
    "function setValue(string newValue)"
  ]
};
  