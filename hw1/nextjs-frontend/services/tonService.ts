import { Address, TonClient, fromNano, toNano } from "@ton/ton";
import { beginCell } from "@ton/core";
import { SimpleStorage } from "./SimpleStorage";

export class TONService {
  private client: TonClient;

  constructor() {
    // Use TON Center API for testnet only
    this.client = new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
      apiKey:
        "8b5688d6912a07e9363349dbe865e2184e57560143cbe8b64bc13ad361f21c91",
    });
  }

  // Get real balance of a TON wallet from testnet
  async getWalletBalance(walletAddress: string): Promise<string> {
    try {
      const address = Address.parse(walletAddress);
      const balance = await this.client.getBalance(address);
      return fromNano(balance);
    } catch (error) {
      console.error("Error fetching wallet balance from testnet:", error);
      throw new Error("Failed to fetch wallet balance from testnet");
    }
  }

  // Get current value from SimpleStorage contract on testnet
  async getContractStorageValue(contractAddress: string): Promise<string> {
    try {
      const address = Address.parse(contractAddress);
      const contract = this.client.open(
        SimpleStorage.createFromAddress(address),
      );

      const data = await contract.getData();
      return data;
    } catch (error) {
      console.error("Error fetching contract storage from testnet:", error);
      throw new Error("Failed to fetch contract storage value from testnet");
    }
  }

  // Get counter value from SimpleStorage contract on testnet
  async getContractCounter(contractAddress: string): Promise<number> {
    try {
      const address = Address.parse(contractAddress);
      const contract = this.client.open(
        SimpleStorage.createFromAddress(address),
      );

      const counter = await contract.getCounter();
      return counter;
    } catch (error) {
      console.error("Error fetching contract counter from testnet:", error);
      throw new Error("Failed to fetch contract counter from testnet");
    }
  }

  // Get ID from SimpleStorage contract on testnet
  async getContractId(contractAddress: string): Promise<number> {
    try {
      const address = Address.parse(contractAddress);
      const contract = this.client.open(
        SimpleStorage.createFromAddress(address),
      );

      const id = await contract.getID();
      return id;
    } catch (error) {
      console.error("Error fetching contract ID from testnet:", error);
      throw new Error("Failed to fetch contract ID from testnet");
    }
  }

  // Create transaction to update contract storage on testnet
  createUpdateTransaction(contractAddress: string, newValue: string) {
    const address = Address.parse(contractAddress);

    // Create properly encoded payload for the contract
    // The contract expects: op::update (32 bits) + query_id (64 bits) + data_ref (cell with string)
    const payload = beginCell()
      .storeUint(0x00957974, 32) // op::update
      .storeUint(0, 64) // query_id (can be 0 for now)
      .storeRef(beginCell().storeStringTail(newValue).endCell())
      .endCell()
      .toBoc()
      .toString("base64");

    return {
      validUntil: Math.floor(Date.now() / 1000) + 60,
      messages: [
        {
          address: address.toString(),
          amount: toNano("0.05").toString(), // 0.05 TON for gas on testnet
          payload: payload,
        },
      ],
    };
  }

  // Get testnet explorer URL for wallet
  getWalletExplorerUrl(walletAddress: string): string {
    return `https://testnet.tonscan.org/address/${walletAddress}`;
  }

  // Get testnet explorer URL for contract
  getContractExplorerUrl(contractAddress: string): string {
    return `https://testnet.tonscan.org/address/${contractAddress}`;
  }

  // Check if address is valid TON address
  isValidTONAddress(address: string): boolean {
    try {
      Address.parse(address);
      return true;
    } catch {
      return false;
    }
  }

  // Format address for display
  formatAddress(address: string): string {
    try {
      const addr = Address.parse(address);
      const fullAddress = addr.toString();
      return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
    } catch {
      return address;
    }
  }
}

// Export singleton instance
export const tonService = new TONService();
