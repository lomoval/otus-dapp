"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Wallet,
  Copy,
  CheckCircle,
  ExternalLink,
  Database,
  RefreshCw,
} from "lucide-react";

// Конфигурация контракта
import { CONTRACT_CONFIG } from "../config/ethereumContractConfig";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface EthereumWalletProps {
  addLog: (
    message: string,
    type?: "success" | "error" | "info" | "warning",
  ) => void;
  updateTotalValue: (value: number) => void;
  onNetworkChange?: (network: string) => void;
}

const getNetworkName = (chainId: string): string => {
  switch (chainId) {
    case "0x1":
      return "Mainnet";
    case "0xaa36a7":
      return "Sepolia";
    case "0x5":
      return "Goerli";
    case "0x89":
      return "Polygon";
    case "0x13881":
      return "Mumbai";
    default:
      return "Unknown";
  }
};

export default function EthereumWallet({
  addLog,
  updateTotalValue,
  onNetworkChange,
}: EthereumWalletProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contractValue, setContractValue] = useState<string>("-");
  const [newValue, setNewValue] = useState<string>("");
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>("Unknown");

  useEffect(() => {
    checkConnection();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      // Cleanup event listeners
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            await getBalance(accounts[0]);
            addLog("MetaMask already connected", "success");
          }

          // Get current network
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          const network = getNetworkName(chainId);
          setCurrentNetwork(network);
          if (onNetworkChange) {
            onNetworkChange(network);
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      addLog(
        "MetaMask is not installed. Please install it to continue.",
        "error",
      );
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await getBalance(accounts[0]);
        addLog(
          `Ethereum wallet connected: ${formatAddress(accounts[0])}`,
          "success",
        );

        // Listen for account changes
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
      }
    } catch (error: any) {
      addLog(`Failed to connect Ethereum wallet: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount("");
    setBalance("");

    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    }

    addLog("Ethereum wallet disconnected", "warning");
  };

  const handleChainChanged = (chainId: string) => {
    const network = getNetworkName(chainId);
    setCurrentNetwork(network);
    if (onNetworkChange) {
      onNetworkChange(network);
    }
    addLog(`Ethereum network changed: ${chainId} (${network})`, "info");
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
      addLog(`Ethereum account changed: ${formatAddress(accounts[0])}`, "info");
    }
  };

  const getBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      // Convert hex string to handle large numbers correctly
      const balanceWei = parseInt(balance.slice(2), 16);

      // Convert Wei to ETH (1 ETH = 10^18 Wei)
      const balanceInEth = balanceWei / 1e18;

      setBalance(balanceInEth.toFixed(4));

      // Update total portfolio value
      updateTotalValue(parseFloat(balanceInEth.toFixed(4)));

      addLog(`Balance updated: ${balanceInEth.toFixed(4)} ETH`, "success");
    } catch (error: any) {
      addLog(`Failed to get balance: ${error.message}`, "error");
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      addLog("Address copied to clipboard", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      addLog("Failed to copy address", "error");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const signMessage = async () => {
    if (!account) return;

    try {
      const message = "Подпишите это идентификационное сообщение!";
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, account],
      });
      addLog(`Message signed: ${signature.slice(0, 10)}...`, "success");
    } catch (error: any) {
      addLog(`Failed to sign message: ${error.message}`, "error");
    }
  };

  const sendTransaction = async () => {
    if (!account) return;

    try {
      const transactionParameters = {
        to: account, // Send to self for demo
        from: account,
        value: "0x0", // 0 ETH
        gas: "0x5208", // 21000 Gwei
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      addLog(`Transaction sent: ${txHash.slice(0, 10)}...`, "success");
    } catch (error: any) {
      addLog(`Failed to send transaction: ${error.message}`, "error");
    }
  };

  // Smart Contract Interactions
  const getContractValue = async () => {
    if (!account) {
      addLog("Please connect wallet first", "warning");
      return;
    }

    setIsContractLoading(true);
    try {
      // const provider = new ethers.BrowserProvider(window.ethereum);
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_CONFIG.abi,
        signer,
      );

      const value = await contract.getValue();
      console.log(value)
      setContractValue(value);
      addLog(`Contract storage read: "${value}"`, "success");
    } catch (error: any) {
      addLog(`Failed to read contract: ${error.message}`, "error");
    } finally {
      setIsContractLoading(false);
    }
  };

  const setContractValueHandler = async () => {
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
      // const provider = new ethers.BrowserProvider(window.ethereum);
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_CONFIG.address,
        CONTRACT_CONFIG.abi,
        signer,
      );

      const tx = await contract.setValue(newValue);
      addLog(`Transaction sent: ${tx.hash}`, "info");

      await tx.wait();
      setContractValue(newValue);
      addLog(`Contract storage updated: "${newValue}"`, "success");
      setNewValue("");
    } catch (error: any) {
      addLog(`Failed to update contract: ${error.message}`, "error");
    } finally {
      setIsContractLoading(false);
    }
  };

  const switchNetwork = async () => {
    const currentChainId = window.ethereum?.chainId;

    if (currentChainId === "0xaa36a7") {
      // Switch to Mainnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x1" }], // Mainnet chain ID
        });
        addLog("Switched to Ethereum Mainnet", "success");
        // Reload to update balance
        window.location.reload();
      } catch (error: any) {
        addLog(`Failed to switch to Mainnet: ${error.message}`, "error");
      }
    } else {
      // Switch to Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], // Sepolia chain ID
        });
        addLog("Switched to Sepolia network", "success");
        // Reload to update balance
        window.location.reload();
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added, try to add it
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia",
                  rpcUrls: ["https://sepolia.infura.io/v3/"],
                  nativeCurrency: {
                    name: "Sepolia ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
            addLog("Sepolia network added", "success");
          } catch (addError: any) {
            addLog(
              `Failed to add Sepolia network: ${addError.message}`,
              "error",
            );
          }
        } else {
          addLog(`Failed to switch network: ${error.message}`, "error");
        }
      }
    }
  };

  const openInExplorer = () => {
    if (account) {
      const chainId = window.ethereum?.chainId;
      let explorerUrl = "https://etherscan.io";

      if (chainId === "0xaa36a7") {
        explorerUrl = "https://sepolia.etherscan.io";
      }

      window.open(`${explorerUrl}/address/${account}`, "_blank");
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <Wallet className="h-6 w-6 mr-3 text-blue-400" />
          Ethereum Portfolio
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
              Connect your MetaMask wallet to manage your Ethereum portfolio
            </p>
          </div>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="btn btn-primary w-full max-w-xs"
          >
            {isLoading ? "Connecting..." : "Connect MetaMask"}
          </button>
          {typeof window.ethereum === "undefined" && (
            <p className="text-sm text-red-400 mt-4">
              MetaMask not detected. Please install the extension.
            </p>
          )}
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
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Explorer
                </button>
                <button
                  onClick={copyAddress}
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
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
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-white">
                  {balance} ETH
                </span>
                <button
                  onClick={() => getBalance(account)}
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Smart Contract Interaction */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Database className="h-5 w-5 mr-2 text-blue-400" />
              Smart Contract Storage
            </h3>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">
                  Current Value
                </span>
                <button
                  onClick={getContractValue}
                  disabled={isContractLoading}
                  className="flex items-center text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1 ${isContractLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>
              <div className="bg-gray-900 rounded px-3 py-2 font-mono text-white">
                {contractValue}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-400">
                  Set New Value
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new storage value..."
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 h-12"
                />
              </div>
              <button
                onClick={setContractValueHandler}
                disabled={isContractLoading || !newValue.trim()}
                className="btn btn-success w-full"
              >
                {isContractLoading ? "Updating..." : "Update Contract Storage"}
              </button>
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

          {/* Network Info */}
          <div className="text-sm text-gray-400">
            <div className="flex items-center justify-between mb-2">
              <p>Current Network: {currentNetwork}</p>
              <button
                onClick={switchNetwork}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                {currentNetwork === "Sepolia"
                  ? "Switch to Mainnet"
                  : "Switch to Sepolia"}
              </button>
            </div>
            <p>
              Make sure you're on the correct network for contract interactions
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
