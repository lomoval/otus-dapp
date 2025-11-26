import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { PROGRAM_ID, NETWORK } from "../config/solana-contract";

export interface StorageAccountData {
  data: string;
  owner: string;
  timestamp: number;
}

export class SolanaContractService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(NETWORK.devnet.rpcUrl, "confirmed");
    this.programId = new PublicKey(PROGRAM_ID);

    // Validate network connection
    this.validateNetwork();
  }

  /**
   * Validate that we're connected to the correct network
   */
  private async validateNetwork(): Promise<void> {
    try {
      const version = await this.connection.getVersion();
      console.log(`✅ Connected to Solana network: ${version["solana-core"]}`);

      // Check if we're on devnet by looking at cluster features
      const genesisHash = await this.connection.getGenesisHash();
      console.log(`🌐 Genesis hash: ${genesisHash}`);

      // Devnet genesis hash starts with Et9
      if (!genesisHash.startsWith("Et9")) {
        console.warn("⚠️  Warning: Connected network might not be devnet");
      }
    } catch (error) {
      console.error("❌ Failed to validate network connection:", error);
      throw new Error(
        "Failed to connect to Solana devnet. Please check your RPC URL.",
      );
    }
  }

  /**
   * Get storage PDA (Program Derived Address) for a user
   */
  getStoragePDA(userPublicKey: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("storage"), userPublicKey.toBuffer()],
      this.programId,
    );
    return pda;
  }

  /**
   * Initialize a storage account for the user
   */
  async initializeStorage(
    userPublicKey: PublicKey,
    initialData: string,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
  ): Promise<string> {
    try {
      // Validate network before proceeding
      await this.validateNetwork();

      const storagePDA = this.getStoragePDA(userPublicKey);

      // Create instruction data for initialize
      // Anchor uses 8-byte discriminators for instructions
      const dataBytes = Buffer.from(initialData, "utf8");
      const instructionData = Buffer.alloc(8 + 4 + dataBytes.length);

      // Initialize instruction discriminator (first 8 bytes of SHA256("global:initialize"))
      const initializeDiscriminator = Buffer.from([
        0xaf, 0xaf, 0x6d, 0x1f, 0x0d, 0x98, 0x9b, 0xed,
      ]);
      initializeDiscriminator.copy(instructionData, 0);

      instructionData.writeUInt32LE(dataBytes.length, 8);
      dataBytes.copy(instructionData, 12);

      console.log(
        "Initialize instruction data:",
        instructionData.toString("hex"),
      );
      console.log("Storage PDA:", storagePDA.toString());
      console.log("User public key:", userPublicKey.toString());

      const transaction = new Transaction().add({
        programId: this.programId,
        keys: [
          { pubkey: storagePDA, isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: true, isWritable: true },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: instructionData,
      });

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      // Sign and send transaction
      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: true, preflightCommitment: "confirmed" },
      );

      // Confirm transaction
      await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      );

      console.log("✅ Storage initialization successful:", signature);
      return signature;
    } catch (error) {
      console.error("❌ Error initializing storage:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        logs: error.logs,
      });
      throw error;
    }
  }

  /**
   * Update data in storage account
   */
  async updateData(
    userPublicKey: PublicKey,
    newData: string,
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
  ): Promise<string> {
    try {
      // Validate network before proceeding
      await this.validateNetwork();

      const storagePDA = this.getStoragePDA(userPublicKey);

      // Create instruction data for update
      // Anchor uses 8-byte discriminators for instructions
      const dataBytes = Buffer.from(newData, "utf8");
      const instructionData = Buffer.alloc(8 + 4 + dataBytes.length);

      // Update instruction discriminator (first 8 bytes of SHA256("global:update_data"))
      const updateDiscriminator = Buffer.from([
        0x3e, 0xd1, 0x3f, 0xe7, 0xcc, 0x5d, 0x94, 0x7b,
      ]);
      updateDiscriminator.copy(instructionData, 0);

      instructionData.writeUInt32LE(dataBytes.length, 8);
      dataBytes.copy(instructionData, 12);

      console.log("Update instruction data:", instructionData.toString("hex"));
      console.log("Storage PDA:", storagePDA.toString());
      console.log("User public key:", userPublicKey.toString());

      const transaction = new Transaction().add({
        programId: this.programId,
        keys: [
          { pubkey: storagePDA, isSigner: false, isWritable: true },
          { pubkey: userPublicKey, isSigner: false, isWritable: false },
        ],
        data: instructionData,
      });

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPublicKey;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      // Sign and send transaction
      const signedTransaction = await signTransaction(transaction);
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: true, preflightCommitment: "confirmed" },
      );

      // Confirm transaction
      await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      );

      console.log("✅ Data update successful:", signature);
      return signature;
    } catch (error) {
      console.error("❌ Error updating data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        logs: error.logs,
      });
      throw error;
    }
  }

  /**
   * Read data from storage account
   */
  async getData(userPublicKey: PublicKey): Promise<StorageAccountData | null> {
    try {
      // Validate network before proceeding
      await this.validateNetwork();

      const storagePDA = this.getStoragePDA(userPublicKey);
      const accountInfo = await this.connection.getAccountInfo(
        storagePDA,
        "confirmed",
      );

      if (!accountInfo) {
        return null;
      }

      // Parse account data according to the Rust structure
      // StorageAccount { data: String, owner: Pubkey, timestamp: i64 }
      console.log("Account data length:", accountInfo.data.length);
      console.log("Account data (hex):", accountInfo.data.toString("hex"));
      const data = this.parseStorageAccountData(accountInfo.data);

      return data;
    } catch (error) {
      console.error("Error reading data:", error);
      throw error;
    }
  }

  /**
   * Parse the storage account data from raw bytes
   */
  private parseStorageAccountData(data: Buffer): StorageAccountData {
    // The account data structure with Anchor discriminator:
    // - 8 bytes for Anchor account discriminator
    // - 4 bytes for string length
    // - string data (variable length)
    // - 32 bytes for owner public key
    // - 8 bytes for timestamp

    console.log("Parsing account data, total length:", data.length);

    let offset = 0;

    // Skip 8-byte Anchor account discriminator
    console.log("Discriminator bytes:", data.subarray(0, 8).toString("hex"));
    offset += 8;

    // Read string length (u32)
    const dataLength = data.readUInt32LE(offset);
    console.log("Data length from account:", dataLength);
    offset += 4;

    // Read string data
    const dataString = data
      .subarray(offset, offset + dataLength)
      .toString("utf8");
    console.log("Data string:", dataString);
    offset += dataLength;

    // Read owner public key (32 bytes)
    const ownerBytes = data.subarray(offset, offset + 32);
    const owner = new PublicKey(ownerBytes).toString();
    console.log("Owner public key:", owner);
    offset += 32;

    // Read timestamp (i64)
    const timestamp = Number(data.readBigInt64LE(offset));
    console.log("Timestamp:", timestamp);

    console.log("Final offset:", offset + 8, "Total data length:", data.length);

    return {
      data: dataString,
      owner,
      timestamp,
    };
  }

  /**
   * Check if storage account exists for user
   */
  async storageAccountExists(userPublicKey: PublicKey): Promise<boolean> {
    try {
      // Validate network before proceeding
      await this.validateNetwork();

      const storagePDA = this.getStoragePDA(userPublicKey);
      const accountInfo = await this.connection.getAccountInfo(
        storagePDA,
        "confirmed",
      );
      return accountInfo !== null;
    } catch (error) {
      console.error("Error checking storage account:", error);
      return false;
    }
  }

  /**
   * Get transaction explorer URL
   */
  getExplorerUrl(signature: string): string {
    return `${NETWORK.devnet.explorerUrl}/tx/${signature}?cluster=devnet`;
  }

  /**
   * Get account explorer URL
   */
  getAccountExplorerUrl(publicKey: string): string {
    return `${NETWORK.devnet.explorerUrl}/address/${publicKey}?cluster=devnet`;
  }
}

// Export singleton instance
export const solanaContractService = new SolanaContractService();
