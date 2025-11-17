/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_ETHEREUM_RPC_URL:
      process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ||
      "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    NEXT_PUBLIC_SOLANA_RPC_URL:
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    NEXT_PUBLIC_TON_RPC_URL:
      process.env.NEXT_PUBLIC_TON_RPC_URL ||
      "https://toncenter.com/api/v2/jsonRPC",
  },
};

module.exports = nextConfig;
