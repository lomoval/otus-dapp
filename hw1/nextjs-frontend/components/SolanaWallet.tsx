"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Copy,
  CheckCircle,
  ExternalLink,
  Database,
  RefreshCw,
  Plus,
  AlertCircle,
} from "lucide-react";
import {
  PublicKey,
  Transaction,
  Connection,
  SystemProgram,
} from "@solana/web3.js";
import {
  solanaContractService,
  StorageAccountData,
} from "../services/solana-contract";
import { PROGRAM_ID } from "../config/solana-contract";

interface SolanaWalletProps {
  addLog: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  updateTotalValue: (value: number) => void;
}

export default function SolanaWallet({
  addLog,
  updateTotalValue,
}: SolanaWalletProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contractData, setContractData] = useState<StorageAccountData | null>(
    null,
  );
  const [newValue, setNewValue] = useState<string>("");
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [storagePDA, setStoragePDA] = useState<string>("");
  const [hasStorageAccount, setHasStorageAccount] = useState<boolean>(false);

  useEffect(() => {
    checkPhantomWallet();
  }, []);

  const checkPhantomWallet = async () => {
    const { solana } = window as any;

    if (solana?.isPhantom) {
      try {
        const response = await solana.connect({ onlyIfTrusted: true });
        if (response) {
          setAccount(response.publicKey.toString());
          setIsConnected(true);
          await getBalance(response.publicKey.toString());
          await checkStorageAccount(response.publicKey.toString());
          addLog(
            "Phantom wallet already connected to Solana Devnet",
            "success",
          );
        }
      } catch (error: any) {
        addLog(
          `Failed to initialize Phantom wallet: ${error.message}`,
          "error",
        );
      }
    } else {
      addLog(
        "Phantom wallet not detected. Please install it to connect.",
        "warning",
      );
    }
  };

  const handleConnect = async (publicKey: any) => {
    const publicKeyStr = publicKey.toString();
    setAccount(publicKeyStr);
    setIsConnected(true);
    await getBalance(publicKeyStr);
    await checkStorageAccount(publicKeyStr);
    addLog(
      `Phantom wallet connected: ${formatAddress(publicKeyStr)}`,
      "success",
    );
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccount("");
    setBalance("");
    setContractData(null);
    setStoragePDA("");
    setHasStorageAccount(false);
    addLog("Phantom wallet disconnected", "warning");
  };

  const handleAccountChanged = async (publicKey: any) => {
    if (publicKey) {
      const publicKeyStr = publicKey.toString();
      setAccount(publicKeyStr);
      await getBalance(publicKeyStr);
      await checkStorageAccount(publicKeyStr);
      addLog(`Solana account changed: ${formatAddress(publicKeyStr)}`, "info");
    } else {
      handleDisconnect();
    }
  };

  const connectWallet = async () => {
    const { solana } = window as any;

    if (!solana?.isPhantom) {
      addLog(
        "Phantom wallet not detected. Please install it to continue.",
        "error",
      );
      return;
    }

    setIsLoading(true);
    try {
      // Check network by testing connection to devnet
      try {
        // Test if we can connect to devnet RPC
        const connection = new Connection("https://api.devnet.solana.com");
        await connection.getVersion();
        addLog("✅ Connected to Solana Devnet RPC", "success");
      } catch (error: any) {
        addLog("❌ Cannot connect to Solana Devnet RPC", "error");
        addLog("Please check your internet connection", "warning");
        setIsLoading(false);
        return;
      }

      // Provide network guidance for Phantom
      addLog("⚠️ CRITICAL: Phantom wallet must be set to Devnet", "error");
      addLog(
        "To fix: Open Phantom → Settings → Networks → Change Network to Devnet",
        "warning",
      );
      addLog("Transactions will fail if wallet is on Mainnet!", "error");

      // Connect to wallet
      const response = await solana.connect();
      const publicKeyStr = response.publicKey.toString();
      setAccount(publicKeyStr);
      setIsConnected(true);
      await getBalance(publicKeyStr);
      await checkStorageAccount(publicKeyStr);

      addLog("✅ Connected to Solana Devnet via Phantom wallet", "success");
    } catch (error: any) {
      if (
        error.message?.includes("network") ||
        error.message?.includes("Network")
      ) {
        addLog("❌ Network error: Please switch Phantom to Devnet", "error");
        addLog(
          "Open Phantom → Settings → Networks → Change Network to Devnet",
          "warning",
        );
      } else {
        addLog(`Failed to connect Phantom wallet: ${error.message}`, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    const { solana } = window as any;

    if (solana) {
      try {
        await solana.disconnect();
      } catch (error: any) {
        addLog(
          `Failed to disconnect Phantom wallet: ${error.message}`,
          "error",
        );
      }
    }
  };

  const getBalance = async (publicKey: string) => {
    try {
      // Use real balance from Solana network
      const connection = solanaContractService["connection"];
      const balance = await connection.getBalance(new PublicKey(publicKey));
      const solBalance = (balance / 1e9).toFixed(4);

      setBalance(solBalance);
      updateTotalValue(parseFloat(solBalance));

      addLog(`Solana balance updated: ${solBalance} SOL`, "info");
    } catch (error: any) {
      addLog(`Failed to get Solana balance: ${error.message}`, "error");
    }
  };

  const checkStorageAccount = async (publicKey: string) => {
    try {
      const userPublicKey = new PublicKey(publicKey);
      const exists =
        await solanaContractService.storageAccountExists(userPublicKey);
      setHasStorageAccount(exists);

      if (exists) {
        const pda = solanaContractService.getStoragePDA(userPublicKey);
        setStoragePDA(pda.toString());
        await getContractData();
      }
    } catch (error: any) {
      addLog(`Failed to check storage account: ${error.message}`, "error");
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      addLog("Solana address copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      addLog("Failed to copy Solana address", "error");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const signMessage = async () => {
    const { solana } = window as any;

    if (!account || !solana) return;

    try {
      const message = new TextEncoder().encode(
        "Hello from Multi-Chain Finance Dashboard!",
      );
      const { signature } = await solana.signMessage(message, "utf8");

      addLog(`Message signed: ${signature.slice(0, 10)}...`, "success");
    } catch (error: any) {
      addLog(`Failed to sign message: ${error.message}`, "error");
    }
  };

  const sendTransaction = async () => {
    const { solana } = window as any;
    const {
      Connection,
      Transaction,
      SystemProgram,
      PublicKey,
      LAMPORTS_PER_SOL,
    } = await import("@solana/web3.js");

    if (!account || !solana) return;

    try {
      const connection = new Connection("https://api.devnet.solana.com");

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(account),
          toPubkey: new PublicKey(account),
          lamports: 0,
        }),
      );

      transaction.feePayer = new PublicKey(account);
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTransaction = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
      );

      addLog(
        `Solana transaction sent: ${signature.slice(0, 10)}...`,
        "success",
      );
    } catch (error: any) {
      addLog(`Failed to send Solana transaction: ${error.message}`, "error");
    }
  };

  // Smart Contract Interactions
  const getContractData = async () => {
    if (!account) {
      addLog("Please connect wallet first", "warning");
      return;
    }

    setIsContractLoading(true);
    try {
      const userPublicKey = new PublicKey(account);
      const data = await solanaContractService.getData(userPublicKey);

      if (data) {
        setContractData(data);
        addLog(`Storage data retrieved: "${data.data}"`, "success");
      } else {
        setContractData(null);
        addLog("No storage account found", "info");
      }
    } catch (error: any) {
      addLog(`Failed to read storage data: ${error.message}`, "error");
      setContractData(null);
    } finally {
      setIsContractLoading(false);
    }
  };

  const initializeStorage = async () => {
    if (!account) {
      addLog("Please connect wallet first", "warning");
      return;
    }

    if (!newValue.trim()) {
      addLog("Please enter initial data", "warning");
      return;
    }

    setIsContractLoading(true);
    try {
      const { solana } = window as any;
      if (!solana) {
        addLog("Phantom wallet not found", "error");
        return;
      }

      // Check network before proceeding
      try {
        // Test devnet RPC connection
        const connection = new Connection("https://api.devnet.solana.com");
        await connection.getVersion();
        addLog("✅ Devnet RPC connection working", "success");
      } catch (error: any) {
        addLog("❌ Cannot connect to Solana Devnet RPC", "error");
        setIsContractLoading(false);
        return;
      }

      // Provide network guidance
      addLog(
        "⚠️ CRITICAL: Phantom wallet must be set to Devnet for transactions",
        "error",
      );
      addLog("Transaction will fail if wallet is on Mainnet!", "error");

      const userPublicKey = new PublicKey(account);

      console.log("Starting storage initialization...");
      addLog("Requesting wallet signature for storage creation...", "info");

      const signature = await solanaContractService.initializeStorage(
        userPublicKey,
        newValue,
        async (transaction: Transaction) => {
          console.log("Transaction ready for signing:", transaction);
          try {
            // Request wallet to sign the transaction
            const signed = await solana.signTransaction(transaction);
            console.log("Transaction signed successfully");
            return signed;
          } catch (signError: any) {
            console.error("Transaction signing failed:", signError);
            addLog(`Transaction signing failed: ${signError.message}`, "error");
            throw signError;
          }
        },
      );

      setHasStorageAccount(true);

      addLog(
        `Storage account created: ${signature.slice(0, 10)}...`,
        "success",
      );
      addLog(
        `View transaction: ${solanaContractService.getExplorerUrl(signature)}`,
        "info",
      );

      // Wait a bit for the transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Refresh data
      await getContractData();
      setNewValue("");
    } catch (error: any) {
      console.error("Initialize storage error:", error);
      if (error?.message?.includes("User rejected the request")) {
        addLog("Transaction was rejected by user", "warning");
      } else {
        addLog(`Failed to create storage account: ${error.message}`, "error");
      }
    } finally {
      setIsContractLoading(false);
    }
  };

  const updateContractData = async () => {
    if (!account) {
      addLog("Please connect wallet first", "warning");
      return;
    }

    if (!newValue.trim()) {
      addLog("Please enter a value to set", "warning");
      return;
    }

    setIsContractLoading(true);
    try {
      const { solana } = window as any;
      if (!solana) {
        addLog("Phantom wallet not found", "error");
        return;
      }

      // Check network before proceeding
      try {
        // Test devnet RPC connection
        const connection = new Connection("https://api.devnet.solana.com");
        await connection.getVersion();
        addLog("✅ Devnet RPC connection working", "success");
      } catch (error: any) {
        addLog("❌ Cannot connect to Solana Devnet RPC", "error");
        setIsContractLoading(false);
        return;
      }

      // Provide network guidance
      addLog(
        "⚠️ CRITICAL: Phantom wallet must be set to Devnet for transactions",
        "error",
      );
      addLog("Transaction will fail if wallet is on Mainnet!", "error");

      const userPublicKey = new PublicKey(account);

      console.log("Starting data update...");
      addLog("Requesting wallet signature for data update...", "info");

      const signature = await solanaContractService.updateData(
        userPublicKey,
        newValue,
        async (transaction: Transaction) => {
          console.log("Transaction ready for signing:", transaction);
          try {
            // Request wallet to sign the transaction
            const signed = await solana.signTransaction(transaction);
            console.log("Transaction signed successfully");
            return signed;
          } catch (signError: any) {
            console.error("Transaction signing failed:", signError);
            addLog(`Transaction signing failed: ${signError.message}`, "error");
            throw signError;
          }
        },
      );

      addLog(`Storage data updated: ${signature.slice(0, 10)}...`, "success");
      addLog(
        `View transaction: ${solanaContractService.getExplorerUrl(signature)}`,
        "info",
      );

      // Wait a bit for the transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Refresh data
      await getContractData();
      setNewValue("");
    } catch (error: any) {
      console.error("Update contract data error:", error);
      if (error?.message?.includes("User rejected the request")) {
        addLog("Transaction was rejected by user", "warning");
      } else {
        addLog(`Failed to update storage data: ${error.message}`, "error");
      }
    } finally {
      setIsContractLoading(false);
    }
  };

  const openInExplorer = () => {
    if (account) {
      window.open(
        solanaContractService.getAccountExplorerUrl(account),
        "_blank",
      );
    }
  };

  const openStorageInExplorer = () => {
    if (storagePDA) {
      window.open(
        solanaContractService.getAccountExplorerUrl(storagePDA),
        "_blank",
      );
    }
  };

  const isPhantomInstalled =
    typeof window !== "undefined" && (window as any).solana?.isPhantom;

  const openProgramInExplorer = () => {
    window.open(
      solanaContractService.getAccountExplorerUrl(PROGRAM_ID),
      "_blank",
    );
  };

  const testNetworkConnection = async () => {
    const { solana } = window as any;
    if (!solana) {
      addLog("Phantom wallet not detected", "error");
      return;
    }

    try {
      addLog("Testing network connections...", "info");

      // Test devnet RPC connection
      try {
        const connection = new Connection("https://api.devnet.solana.com");
        const version = await connection.getVersion();
        addLog("✅ Devnet RPC connection working", "success");
        addLog(`Solana version: ${version["solana-core"]}`, "info");
      } catch (error: any) {
        addLog(`❌ Devnet RPC connection failed: ${error.message}`, "error");
      }

      // Test contract service connection
      try {
        if (account) {
          await solanaContractService.getData(new PublicKey(account));
          addLog("✅ Contract service working", "success");
        } else {
          addLog("ℹ️ Connect wallet to test contract service", "info");
        }
      } catch (error: any) {
        addLog(`❌ Contract service failed: ${error.message}`, "error");
      }

      // Provide Phantom network guidance
      addLog("⚠️ CRITICAL: Phantom wallet must be set to Devnet", "error");
      addLog(
        "To fix: Open Phantom → Settings → Networks → Change Network to Devnet",
        "warning",
      );
      addLog("Transactions will fail if wallet is on Mainnet!", "error");
    } catch (error: any) {
      addLog(`Network test failed: ${error.message}`, "error");
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Wallet className="h-6 w-6 mr-3 text-purple-400" />
          Solana Portfolio
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected ? "status-connected" : "status-disconnected"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-6">
              Connect your Phantom wallet to manage your Solana portfolio
            </p>
          </div>

          {isPhantomInstalled ? (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className="btn btn-purple w-full max-w-xs"
            >
              {isLoading ? "Connecting..." : "Connect Phantom"}
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-red-400">
                Phantom wallet not detected. Please install the extension.
              </p>
              <button
                onClick={() => window.open("https://phantom.app/", "_blank")}
                className="btn btn-purple"
              >
                Install Phantom
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-400">
            <p>Supported wallets: Phantom, Solflare, Backpack</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">Account</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={openInExplorer}
                  className="flex items-center text-sm text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Explorer
                </button>
                <button
                  onClick={copyAddress}
                  className="flex items-center text-sm text-purple-400 hover:text-purple-300"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <p className="font-mono text-lg break-all text-white">{account}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">Balance</span>
              <span className="text-lg font-semibold text-white">
                {balance} SOL
              </span>
            </div>
          </div>

          {/* Smart Contract Interaction */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Database className="h-5 w-5 mr-2 text-purple-400" />
              Solana Program Storage
            </h3>

            {/* Storage Account Status */}
            <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">
                  Storage Account
                </span>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    hasStorageAccount
                      ? "bg-green-900 text-green-300"
                      : "bg-yellow-900 text-yellow-300"
                  }`}
                >
                  {hasStorageAccount ? "Created" : "Not Created"}
                </div>
              </div>
              {storagePDA && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">PDA:</span>
                  <button
                    onClick={openStorageInExplorer}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
                  >
                    {formatAddress(storagePDA)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Current Data Display */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">
                  Current Data
                </span>
                <button
                  onClick={getContractData}
                  disabled={isContractLoading || !hasStorageAccount}
                  className="flex items-center text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1 ${isContractLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
              {contractData ? (
                <div className="bg-gray-900 rounded px-3 py-2">
                  <div className="font-mono text-white break-all mb-2">
                    {contractData.data}
                  </div>
                  <div className="text-xs text-gray-400 flex justify-between">
                    <span>Owner: {formatAddress(contractData.owner)}</span>
                    <span>
                      Updated:{" "}
                      {new Date(contractData.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded px-3 py-2 text-gray-400 text-center">
                  {hasStorageAccount
                    ? "No data available"
                    : "Storage account not created"}
                </div>
              )}
            </div>

            {/* Data Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  {hasStorageAccount ? "Update Data" : "Initial Data"}
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={
                    hasStorageAccount
                      ? "Enter new data..."
                      : "Enter initial data..."
                  }
                  maxLength={100}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {newValue.length}/100 characters
                </div>
              </div>

              {hasStorageAccount ? (
                <button
                  onClick={updateContractData}
                  disabled={isContractLoading || !newValue.trim()}
                  className="btn btn-success w-full"
                >
                  {isContractLoading ? "Updating..." : "Update Storage Data"}
                </button>
              ) : (
                <button
                  onClick={initializeStorage}
                  disabled={isContractLoading || !newValue.trim()}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  {isContractLoading ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Storage Account
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Network Info */}
            <div className="mt-4 p-3 bg-blue-900/20 rounded border border-blue-700/50">
              <div className="flex items-start space-x-2">
                <div className="text-xs text-blue-300">
                  <p className="font-medium">Connected to Solana Devnet</p>
                  <p>
                    Program ID:{" "}
                    <button
                      onClick={openProgramInExplorer}
                      className="underline hover:text-blue-200"
                    >
                      {formatAddress(
                        solanaContractService["programId"].toString(),
                      )}
                    </button>
                  </p>
                  <p>Make sure you have devnet SOL for transactions</p>
                  <p className="text-red-300 mt-1 font-medium">
                    ⚠️ CRITICAL: Phantom wallet must be on Devnet network
                  </p>
                  <p className="text-xs text-yellow-200 mt-1">
                    Settings → Networks → Change Network to Devnet
                  </p>
                  <p className="text-xs text-red-300 mt-1 font-semibold">
                    ❌ Transactions will fail if wallet is on Mainnet!
                  </p>
                  <p className="text-xs text-yellow-300 mt-1">
                    If transactions fail, check Phantom network settings
                  </p>
                  <button
                    onClick={testNetworkConnection}
                    className="mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded"
                  >
                    Test Network Connection
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={signMessage} className="btn btn-primary">
              Sign Message
            </button>
            <button onClick={sendTransaction} className="btn btn-secondary">
              Send Transaction
            </button>
            <button
              onClick={() => getBalance(account)}
              className="btn btn-secondary"
            >
              Refresh Balance
            </button>
            <button onClick={disconnectWallet} className="btn btn-danger">
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
