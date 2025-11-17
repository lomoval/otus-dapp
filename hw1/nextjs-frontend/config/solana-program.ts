// Solana program configuration
export const SOLANA_PROGRAM_CONFIG = {
  // Program ID for the simple storage contract
  PROGRAM_ID: "D8P3ya35EZsQyRMVChDwGse67cwD7DvV8macYVX8fjL9",

  // Network configuration
  NETWORK: {
    devnet: {
      rpcUrl: "https://api.devnet.solana.com",
      wsUrl: "wss://api.devnet.solana.com/",
      explorerUrl: "https://explorer.solana.com",
      // Alternative RPC endpoints for better reliability
      rpcUrls: [
        "https://api.devnet.solana.com",
        "https://devnet.helius-rpc.com/?api-key=default",
        "https://solana-devnet.g.alchemy.com/v2/demo",
      ],
    },
    mainnet: {
      rpcUrl: "https://api.mainnet-beta.solana.com",
      wsUrl: "wss://api.mainnet-beta.solana.com/",
      explorerUrl: "https://explorer.solana.com",
    },
  },

  // Program instructions
  INSTRUCTIONS: {
    INITIALIZE: 0,
    UPDATE_DATA: 1,
    GET_DATA: 2,
  },

  // Program features
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
export const PROGRAM_ID = SOLANA_PROGRAM_CONFIG.PROGRAM_ID;
export const NETWORK = SOLANA_PROGRAM_CONFIG.NETWORK;
export const INSTRUCTIONS = SOLANA_PROGRAM_CONFIG.INSTRUCTIONS;
export const FEATURES = SOLANA_PROGRAM_CONFIG.FEATURES;

// Export deployment information
export const DEPLOYMENT_INFO = {
  signature: "wjYbfhBDjCPSw5ZDhuSqzUZ3nhDAXt9BgSNGL9WV9vP5BSPGYTxtV9Ae6j4boigEVSQzWbFhjqvKjsJ7tsJdPn8",
  cluster: "devnet",
  timestamp: new Date().toISOString(),
  programName: "simple_storage_anchor",
} as const;
