// Solana contract deployment information
export const SOLANA_DEPLOYMENT = {
  // Program deployment details
  PROGRAM: {
    id: "D8P3ya35EZsQyRMVChDwGse67cwD7DvV8macYVX8fjL9",
    name: "simple_storage_anchor",
    owner: "BPFLoaderUpgradeab1e11111111111111111111111",
    programDataAddress: "2FYpnHVo8esT4qiGKFhg5QYdU2WstMt4RjF29NSUoj9Q",
    authority: "EU9eZojqGaNdWh5GuuQiBsgMKrKXfuA9L8MpWPDs1E4r",
    lastDeployedSlot: 418163359,
    dataLength: 228696,
    balance: 1.59292824,
  },

  // IDL information
  IDL: {
    account: "6Z5B6rFCNTgcTURKjnFc5vx6K2TWSvZYNpcmHVb2zj51",
    dataLength: 620,
  },

  // Deployment transaction
  DEPLOYMENT: {
    signature:
      "wjYbfhBDjCPSw5ZDhuSqzUZ3nhDAXt9BgSNGL9WV9vP5BSPGYTxtV9Ae6j4boigEVSQzWbFhjqvKjsJ7tsJdPn8",
    cluster: "devnet",
    timestamp: new Date().toISOString(),
  },

  // Wallet information
  WALLET: {
    address: "EU9eZojqGaNdWh5GuuQiBsgMKrKXfuA9L8MpWPDs1E4r",
    balance: 0.39869688,
  },

  // Contract features
  FEATURES: {
    storage: {
      maxDataLength: 100,
      updatableByAnyone: true,
      pdaSeeds: ["storage", "user_key"],
    },
    instructions: {
      initialize: "Initialize storage account with initial data",
      updateData: "Update stored data (anyone can update)",
      getData: "Read stored data",
    },
  },
} as const;

// Export individual constants for easier access
export const PROGRAM_ID = SOLANA_DEPLOYMENT.PROGRAM.id;
export const PROGRAM_DATA_ADDRESS =
  SOLANA_DEPLOYMENT.PROGRAM.programDataAddress;
export const IDL_ACCOUNT = SOLANA_DEPLOYMENT.IDL.account;
export const DEPLOYMENT_SIGNATURE = SOLANA_DEPLOYMENT.DEPLOYMENT.signature;
export const WALLET_ADDRESS = SOLANA_DEPLOYMENT.WALLET.address;
